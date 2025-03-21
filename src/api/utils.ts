import { GameState, Card, CardColor, PlayerType, GamePhase, CardValue, Player } from '@/types/game';
import { SECRET_KEY } from '@/constants';

// Types from backend
interface BackendCard {
    id: string;
    color: string;
    value: number;
    isHidden: boolean;
}

interface BackendPlayer {
    id: string;
    name: string;
    type: PlayerType;
    hand: BackendCard[];
    expeditions: { [key: string]: BackendCard[] };
    score: number;
}

interface BackendGameState {
    players: BackendPlayer[];
    currentPlayerIndex: number;
    deck: BackendCard[];
    discardPiles: { [key: string]: BackendCard[] };
    selectedCard: BackendCard | null;
    gamePhase: GamePhase;
    isAIThinking: boolean;
    lastDiscarded: { color: CardColor; cardId: string } | undefined;
    winner: string | null;
}

// Transform functions
const transformCard = (card: BackendCard): Card => ({
    id: card.id,
    color: card.color as CardColor,
    value: card.value === 0 ? 'HS' : card.value,
    isHidden: card.isHidden,
});

const transformPlayer = (player: BackendPlayer): Player => ({
    id: player.id,
    name: player.name,
    type: player.type,
    hand: player.hand.map(transformCard),
    expeditions: Object.fromEntries(
        Object.entries(player.expeditions).map(([color, cards]) => [
            color as CardColor,
            cards.map(transformCard),
        ])
    ) as Record<CardColor, Card[]>,
    score: player.score,
});

const transformGameState = (state: BackendGameState): GameState => ({
    players: state.players.map(transformPlayer),
    currentPlayerIndex: state.currentPlayerIndex,
    deck: state.deck.map(transformCard),
    discardPiles: Object.fromEntries(
        Object.entries(state.discardPiles).map(([color, cards]) => [
            color as CardColor,
            cards.map(transformCard),
        ])
    ) as Record<CardColor, Card[]>,
    selectedCard: state.selectedCard ? transformCard(state.selectedCard) : null,
    gamePhase: state.gamePhase,
    isAIThinking: state.isAIThinking ?? false,
    lastDiscarded: state.lastDiscarded,
    winner: state.winner,
});

// Transform back functions
const transformCardBack = (card: Card): BackendCard => ({
    id: card.id,
    color: card.color,
    value: card.value === 'HS' ? 0 : Number(card.value),
    isHidden: card.isHidden || false,
});

// Transform the game state for the backend API
function transformGameStateForBackend(state: GameState) {
    const transformCard = (card: Card) => {
        if (!card) {
            console.warn('Attempted to transform undefined or null card');
            return null;
        }
        return {
            id: card.id,
            color: card.color,
            value: card.value === 'HS' ? 0 : card.value,
            isHidden: card.isHidden || false
        };
    };

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
                    color,
                    cards.map(transformCard)
                ])
            ),
            score: player.score
        })),
        discardPiles: Object.fromEntries(
            Object.entries(state.discardPiles).map(([color, cards]) => [
                color,
                cards.map(transformCard)
            ])
        ),
        deck: state.deck.map(transformCard)
    };
}

export async function startNewGame(): Promise<GameState> {
    try {
        console.log('Starting new game...');
        const response = await fetch(`/api/start_game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${SECRET_KEY}`,
            },
            redirect: 'follow', // Follow any redirects
        });

        // Log response details for debugging
        console.log('Response status:', response.status);
        console.log('Response type:', response.type);
        console.log('Response URL:', response.url);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            console.error('Response not OK:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                type: response.type
            });
            throw new Error(`API request failed: ${response.status} - ${responseText}`);
        }

        // Try to parse JSON only if we have content
        if (!responseText || responseText.trim() === '') {
            console.error('Empty response received');
            throw new Error('Empty response from server');
        }

        try {
            const data = JSON.parse(responseText);
            console.log('Parsed response:', data);
            // Handle potential HuggingFace Space response format
            const gameState = data.data || data;
            return transformGameState(gameState);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error(`Failed to parse server response: ${responseText}`);
        }
    } catch (error) {
        console.error('Failed to start new game:', error);
        throw error instanceof Error ? error : new Error(String(error));
    }
}

export async function getAIMove(gameState: GameState, maxRetries: number = 5, retryDelay: number = 1000): Promise<[number, number, number]> {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            const transformedState = transformGameStateForBackend(gameState);
            
            const response = await fetch(`/api/get_ai_move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(transformedState),
                redirect: 'follow',
            });

            // Log response details for debugging
            console.log('Response status:', response.status);
            console.log('Response type:', response.type);
            console.log('Response URL:', response.url);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (!response.ok) {
                console.error('Response not OK:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    type: response.type
                });
                throw new Error(`API request failed: ${response.status} - ${responseText}`);
            }

            // Try to parse JSON only if we have content
            if (!responseText || responseText.trim() === '') {
                console.error('Empty response received');
                throw new Error('Empty response from server');
            }

            try {
                const data = JSON.parse(responseText);
                console.log('Parsed response:', data);
                // Handle potential HuggingFace Space response format
                const result = data.data || data;
                return result.action;
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error(`Failed to parse server response: ${responseText}`);
            }

        } catch (error) {
            console.error(`Attempt ${attempts + 1} failed:`, error);
            attempts += 1;

            if (attempts < maxRetries) {
                console.log(`Retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                throw error instanceof Error ? error : new Error(String(error));
            }
        }
    }
    
    throw new Error('Failed to get AI move: Max retries exceeded');
}