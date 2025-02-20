import { GameState, Card, CardColor } from '@/types/game';
import { calculateExpeditionScore, createInitialGameState } from '@/utils/gameUtils';

export type GameAction = 
    | { type: 'SELECT_CARD'; payload: Card }
    | { type: 'PLAY_CARD'; payload: { card: Card; color: CardColor } }
    | { type: 'DISCARD_CARD'; payload: Card }
    | { type: 'DRAW_FROM_DECK' }
    | { type: 'DRAW_FROM_DISCARD'; payload: CardColor }
    | { type: 'START_AI_TURN' }
    | { type: 'END_AI_TURN' }
    | { type: 'SET_LAST_DISCARDED'; payload: { color: CardColor; cardId: string } }
    | { type: 'RESET_GAME' };

const canPlayCard = (card: Card, expedition: Card[]): boolean => {
    /*
    checks if a card can be placed to an expedition
    */
    if (!expedition.length) return true;
    else if (card.value === 'HS') return expedition.every(c => c.value === 'HS')
    const lastCard = expedition[expedition.length - 1];
    return lastCard.value === 'HS' || 
        (typeof card.value === 'number' && 
         typeof lastCard.value === 'number' && 
         card.value > lastCard.value);
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    /*
    reducer for the game state
    list of the actions:
    - `SELECT_CARD`: select a card from the hand
    - `PLAY_CARD`: play a card to an expedition
    - `DISCARD_CARD`: discard a card to the discard pile
    - `DRAW_FROM_DECK`: draw a card from the deck
    - `DRAW_FROM_DISCARD`: draw a card from the discard pile
    - `START_AI_TURN`: start the AI's turn
    */
    switch (action.type) {
        case 'SELECT_CARD': {
            return {
                ...state,
                selectedCard: action.payload
            };
        }
        
        case 'PLAY_CARD': {
            const currentPlayer = state.players[state.currentPlayerIndex];
            const { card, color } = action.payload;
            
            if (!card || !canPlayCard(card, currentPlayer.expeditions[color])) {
                return state;
            }
            
            return {
                ...state,
                players: [
                    ...state.players.slice(0, state.currentPlayerIndex),
                    {
                        ...currentPlayer,
                        hand: currentPlayer.hand.filter(c => c?.id !== undefined && c.id !== card.id),
                        expeditions: {
                            ...currentPlayer.expeditions,
                            [color]: [...currentPlayer.expeditions[color], card]
                        }
                    },
                    ...state.players.slice(state.currentPlayerIndex + 1)
                ],
                selectedCard: null,
                gamePhase: 'DRAW'
            };
        }
        
        case 'DISCARD_CARD': {
            const currentPlayer = state.players[state.currentPlayerIndex];
            const cardToDiscard = action.payload;

            if (!cardToDiscard || !cardToDiscard.id) {
                return state;
            }
            
            return {
                ...state,
                players: [
                    ...state.players.slice(0, state.currentPlayerIndex),
                    {
                        ...currentPlayer,
                        hand: currentPlayer.hand.filter(c => c?.id !== undefined && c.id !== cardToDiscard.id)
                    },
                    ...state.players.slice(state.currentPlayerIndex + 1)
                ],
                discardPiles: {
                    ...state.discardPiles,
                    [cardToDiscard.color]: [...state.discardPiles[cardToDiscard.color], cardToDiscard]
                },
                selectedCard: null,
                gamePhase: 'DRAW'
            };
        }
        
        case 'DRAW_FROM_DECK': {
            const currentPlayer = state.players[state.currentPlayerIndex];
            const [drawnCard, ...remainingDeck] = state.deck;
            
            // Check for game over
            if (remainingDeck.length === 0) {
                // Calculate final scores
                const playerScore = Object.values(state.players[0].expeditions)
                    .reduce((total, exp) => total + calculateExpeditionScore(exp), 0);
                const aiScore = Object.values(state.players[1].expeditions)
                    .reduce((total, exp) => total + calculateExpeditionScore(exp), 0);
                
                return {
                    ...state,
                    players: [
                        { ...state.players[0], score: playerScore },
                        { ...state.players[1], score: aiScore }
                    ],
                    gamePhase: 'GAME_OVER',
                    winner: playerScore > aiScore ? state.players[0].name :
                           aiScore > playerScore ? state.players[1].name : null
                };
            }
            
            return {
                ...state,
                players: [
                    ...state.players.slice(0, state.currentPlayerIndex),
                    {
                        ...currentPlayer,
                        hand: [...currentPlayer.hand, drawnCard]
                    },
                    ...state.players.slice(state.currentPlayerIndex + 1)
                ],
                deck: remainingDeck,
                gamePhase: 'PLAY',
                currentPlayerIndex: (state.currentPlayerIndex + 1) % 2
            };
        }
        
        case 'DRAW_FROM_DISCARD': {
            const color = action.payload;
            const currentPlayer = state.players[state.currentPlayerIndex];
            const discardPile = state.discardPiles[color];
            const drawnCard = discardPile[discardPile.length - 1];
            
            return {
                ...state,
                players: [
                    ...state.players.slice(0, state.currentPlayerIndex),
                    {
                        ...currentPlayer,
                        hand: [...currentPlayer.hand, drawnCard]
                    },
                    ...state.players.slice(state.currentPlayerIndex + 1)
                ],
                discardPiles: {
                    ...state.discardPiles,
                    [color]: discardPile.slice(0, -1)
                },
                gamePhase: 'PLAY',
                currentPlayerIndex: (state.currentPlayerIndex + 1) % 2
            };
        }
        
        case 'START_AI_TURN': {
            return {
                ...state,
                isAIThinking: true
            };
        }
        
        case 'END_AI_TURN': {
            return {
                ...state,
                isAIThinking: false
            };
        }
        
        case 'SET_LAST_DISCARDED': {
            return {
                ...state,
                lastDiscarded: action.payload
            };
        }
        
        case 'RESET_GAME':
            return createInitialGameState('Player');
        
        default:
            return state;
    }
}; 