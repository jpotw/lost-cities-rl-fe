import { Card, CardColor, GameState, Player } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';

export const COLORS: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'WHITE', 'PURPLE'];
const NUMBER_VALUES: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// shuffle algorithm
const shuffleDeck = (deck: Card[]): Card[] => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

export const createDeck = (): Card[] => {
      /*
    creates and shuffles the card deck
    */
    const deck: Card[] = [];
    
    COLORS.forEach(color => {
        // Add handshake cards (3 per color)
        for (let i = 0; i < 3; i++) {
            deck.push({
                id: String(deck.length + 1),
                color,
                value: 'HS'
            });
        }
        
        // Add number cards (2-10)
        NUMBER_VALUES.forEach(value => {
            deck.push({
                id: String(deck.length + 1),
                color,
                value
            });
        });
    });
    
    return shuffleDeck(deck);
};

export const createInitialGameState = (playerName: string): GameState => {
    /*
    creates the initial game state
    1. creates deck
    2. deals 8 cards to each players
    3. sets up other game state variables
    */
    const deck = createDeck();
    const playerHand = deck.slice(0, 8);
    const aiHand = deck.slice(8, 16).map(card => ({ ...card, isHidden: true }));
    const remainingDeck = deck.slice(16);
    
    return {
        players: [
            {
                id: uuidv4(),
                name: playerName,
                type: 'HUMAN',
                hand: playerHand,
                expeditions: {
                    RED: [],
                    BLUE: [],
                    GREEN: [],
                    YELLOW: [],
                    WHITE: [],
                    PURPLE: []
                },
                score: 0
            },
            {
                id: uuidv4(),
                name: 'AI Opponent',
                type: 'AI',
                hand: aiHand,
                expeditions: {
                    RED: [],
                    BLUE: [],
                    GREEN: [],
                    YELLOW: [],
                    WHITE: [],
                    PURPLE: []
                },
                score: 0
            }
        ],
        currentPlayerIndex: 0,
        deck: remainingDeck,
        discardPiles: {
            RED: [],
            BLUE: [],
            GREEN: [],
            YELLOW: [],
            WHITE: [],
            PURPLE: []
        },
        selectedCard: null,
        gamePhase: 'PLAY',
        winner: null,
        isAIThinking: false
    };
};

export const calculateExpeditionScore = (expedition: Card[]): number => {
    /*
    calculates the score for an expedition in a single color
    */
    if (expedition.length === 0) return 0;
    
    let score = 0;
    let multiplier = 1;
    let numCards = 0;
    
    for (const card of expedition) {
        numCards++;
        if (card.value === 'HS') {
            multiplier++;
        } else if (typeof card.value === 'number') {
            score += card.value;
        }
    }
    
    score = (score - 20) * multiplier; // Base expedition cost
    if (numCards >= 8) score += 20; // Bonus for 8+ cards
    
    return score;
};

export const calculateScore = (player: Player): number => {
  let totalScore = 0;

  // Calculate score for each expedition
  Object.values(player.expeditions).forEach((expedition: Card[]) => {
    if (expedition.length === 0) return;

    let expeditionScore = 0;
    let multiplier = 1;

    // Calculate raw points and multipliers
    expedition.forEach((card: Card) => {
      if (card.value === 'HS') {
        multiplier += 1;
      } else if (typeof card.value === 'number') {
        expeditionScore += card.value;
      }
    });

    // Apply expedition cost (-20)
    expeditionScore -= 20;

    // Apply multiplier
    expeditionScore *= multiplier;

    // Add to total score
    totalScore += expeditionScore;
  });

  return totalScore;
}; 