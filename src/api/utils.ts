import { GameState, Card, CardColor } from '@/types/game';

// Transform the game state for the backend API
function transformGameStateForBackend(state: GameState) {
    const transformColor = (color: string) => color.toUpperCase();
    
    const transformCard = (card: Card) => ({
        id: card.id,
        suit: transformColor(card.color),
        value: card.value === 'HS' ? 0 : card.value,
        isHidden: card.isHidden || false
    });

    return {
        currentPlayerIndex: state.currentPlayerIndex,
        gamePhase: state.gamePhase,
        selectedCard: state.selectedCard ? transformCard(state.selectedCard) : null,
        players: state.players.map(player => ({
            id: player.id,
            name: player.name,
            type: player.type,
            hand: player.hand.map(transformCard),
            expeditions: Object.fromEntries(
                Object.entries(player.expeditions).map(([color, cards]) => [
                    transformColor(color),
                    cards.map(transformCard)
                ])
            ),
            score: player.score
        })),
        discardPiles: Object.fromEntries(
            Object.entries(state.discardPiles).map(([color, cards]) => [
                transformColor(color),
                cards.map(transformCard)
            ])
        ),
        deck: state.deck.map(transformCard)
    };
}

export async function getAIMove(gameState: GameState, maxRetries: number = 5, retryDelay: number = 1000): Promise<[number, number, number]> {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            const transformedState = transformGameStateForBackend(gameState);
            console.log('Sending state to backend:', JSON.stringify(transformedState, null, 2));
            
            const response = await fetch(`/api/get_ai_move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transformedState),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.action;
        } catch (error: any) {
            console.error(`Attempt ${attempts + 1} failed:`, error);
            console.error('Error details:', error.stack);
            attempts += 1;

            if (attempts < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                throw new Error(`Max retries reached. Please check the API endpoint. Last error: ${error.message}`);
            }
        }
    }
    
    throw new Error('Failed to get AI move: Max retries exceeded');
}