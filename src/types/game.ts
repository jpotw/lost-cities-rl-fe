export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'white' | 'purple';
export type CardValue = number | 'HS';

export type Card = {
    id: number;
    color: CardColor;
    value: CardValue;
    isHidden?: boolean; // Frontend-specific
    isSelected?: boolean; // Frontend-specific
};

export type PlayerType = 'HUMAN' | 'AI';
export type GamePhase = 'PLAY' | 'DRAW' | 'GAME_OVER';

export type Player = {
    id: string;
    name: string;
    type: PlayerType;
    hand: Card[];
    expeditions: Record<CardColor, Card[]>;
    score: number;
};

export type GameState = {
    players: Player[];
    currentPlayerIndex: number;
    deck: Card[];
    discardPiles: Record<CardColor, Card[]>;
    selectedCard: Card | null;
    gamePhase: GamePhase;
    isAIThinking?: boolean;
    lastDiscarded?: {
        color: CardColor;
        cardId: number;
    };
    winner?: string | null;
};