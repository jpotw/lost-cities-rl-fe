import { GameState, Card, CardColor, PlayerType, GamePhase } from '@/types/game';
import { SECRET_KEY } from '@/constants';

interface BackendCard {
    id: number;
    suit: string;
    value: number | 'HS';
    isHidden: boolean;
}

interface BackendPlayer {
    id: string;
    name: string;
    type: PlayerType;
    hand: BackendCard[];
    expeditions: Record<string, BackendCard[]>;
    score: number;
}

interface BackendGameState {
    currentPlayerIndex: number;
    gamePhase: GamePhase;
    selectedCard: BackendCard | null;
    players: BackendPlayer[];
    discardPiles: Record<string, BackendCard[]>;
    deck: BackendCard[];
}

// Transform backend game state to frontend format
function transformGameStateFromBackend(state: BackendGameState): GameState {
    const transformColor = (suit: string): CardColor => suit.toLowerCase() as CardColor;
    
    const transformCard = (card: BackendCard): Card => ({
        id: card.id.toString(),
        color: transformColor(card.suit),
        value: card.value,
        isHidden: card.isHidden
    });

    const emptyExpeditions: Record<CardColor, Card[]> = {
        red: [],
        blue: [],
        green: [],
        white: [],
        yellow: [],
        purple: []
    };

    return {
        currentPlayerIndex: state.currentPlayerIndex,
        gamePhase: state.gamePhase,
        selectedCard: state.selectedCard ? transformCard(state.selectedCard) : null,
        players: state.players.map((player: BackendPlayer) => ({
            id: player.id,
            name: player.name,
            type: player.type,
            hand: player.hand.map(transformCard),
            expeditions: {
                ...emptyExpeditions,
                ...Object.fromEntries(
                    Object.entries(player.expeditions).map(([suit, cards]) => [
                        transformColor(suit),
                        (cards as BackendCard[]).map(transformCard)
                    ])
                )
            },
            score: player.score
        })),
        discardPiles: {
            ...emptyExpeditions,
            ...Object.fromEntries(
                Object.entries(state.discardPiles).map(([suit, cards]) => [
                    transformColor(suit),
                    (cards as BackendCard[]).map(transformCard)
                ])
            )
        },
        deck: state.deck.map(transformCard),
        isAIThinking: false,
        lastDiscarded: undefined,
        winner: null
    };
}

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
            return transformGameStateFromBackend(gameState);
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