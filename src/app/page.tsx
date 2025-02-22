'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameBoard } from '@/components/GameBoard';
import { createInitialGameState } from '@/utils/gameUtils';
import type { GameState } from '@/types/game';
import { gameReducer, GameAction } from '@/reducers/gameReducer';

// Empty initial state for SSR
const emptyGameState: GameState = {
  players: [
    {
      id: 'player',
      name: 'Player',
      type: 'HUMAN',
      hand: [],
      score: 0,
      expeditions: {
        red: [],
        blue: [],
        green: [],
        yellow: [],
        white: [],
        purple: []
      }
    },
    {
      id: 'ai',
      name: 'AI',
      type: 'AI',
      hand: [],
      score: 0,
      expeditions: {
        red: [],
        blue: [],
        green: [],
        yellow: [],
        white: [],
        purple: []
      }
    }
  ],
  currentPlayerIndex: 0,
  gamePhase: 'PLAY',
  selectedCard: null,
  deck: [],
  discardPiles: {
    red: [],
    blue: [],
    green: [],
    yellow: [],
    white: [],
    purple: []
  },
  winner: null,
  isAIThinking: false
};

export default function Home() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>(emptyGameState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      setGameState(createInitialGameState('Player'));
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleGameAction = (action: GameAction) => {
    setGameState(prevState => gameReducer(prevState, action));
  };

  return (
    <div className="h-screen overflow-hidden">
      <GameBoard
        gameState={gameState}
        onGameAction={handleGameAction}
      />
    </div>
  );
}
