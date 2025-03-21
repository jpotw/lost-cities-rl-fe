export type CardColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'WHITE' | 'PURPLE';
export type CardValue = number | 'HS';

export interface Card {
    id: string;
    color: CardColor;
    value: CardValue;
    isHidden?: boolean; // Frontend-specific
    isSelected?: boolean; // Frontend-specific
}

export type PlayerType = 'HUMAN' | 'AI';
export type GamePhase = 'PLAY' | 'DRAW' | 'GAME_OVER';

export interface Player {
    id: string;
    name: string;
    type: PlayerType;
    hand: Card[];
    expeditions: Record<CardColor, Card[]>;
    score: number;
}

export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    deck: Card[];
    discardPiles: Record<CardColor, Card[]>;
    selectedCard: Card | null;
    gamePhase: GamePhase;
    isAIThinking: boolean;
    lastDiscarded?: {
        color: CardColor;
        cardId: string;
    };
    winner: string | null;
}