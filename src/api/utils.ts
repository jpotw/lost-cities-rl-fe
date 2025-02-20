import { GameState } from '@/types/game';

const API_BASE_URL = 'http://localhost:8000';

function transformGameStateForBackend(state: GameState) {
    return {
        ...state,
        players: state.players.map(player => ({
            ...player,
            hand: player.hand.map(card => ({
                id: card.id,
                suit: card.color.toUpperCase(),
                value: card.value,
                isHidden: card.isHidden || false
            })),
            expeditions: Object.fromEntries(
                Object.entries(player.expeditions).map(([color, cards]) => [
                    color.toUpperCase(),
                    cards.map(card => ({
                        id: card.id,
                        suit: card.color.toUpperCase(),
                        value: card.value,
                        isHidden: card.isHidden || false
                    }))
                ])
            )
        })),
        discardPiles: Object.fromEntries(
            Object.entries(state.discardPiles).map(([color, cards]) => [
                color.toUpperCase(),
                cards.map(card => ({
                    id: card.id,
                    suit: card.color.toUpperCase(),
                    value: card.value,
                    isHidden: card.isHidden || false
                }))
            ])
        ),
        deck: state.deck.map(card => ({
            id: card.id,
            suit: card.color.toUpperCase(),
            value: card.value,
            isHidden: card.isHidden || false
        }))
    };
}

export async function getAIMove(gameState: GameState, maxRetries: number = 5, retryDelay: number = 1000): Promise<[number, number, number]> {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            const transformedState = transformGameStateForBackend(gameState);
            console.log('Sending state to backend:', JSON.stringify(transformedState, null, 2));
            
            const response = await fetch(`${API_BASE_URL}/api/get_ai_move`, {
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
            console.log('Received response from backend:', data);
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