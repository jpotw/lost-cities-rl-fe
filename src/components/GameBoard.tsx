'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, CardColor, GameState } from '@/types/game';
import { COLORS } from '@/utils/gameUtils';
import { GameAction } from '@/reducers/gameReducer';
import { PlayerHand } from './PlayerHand';
import { Expedition } from './Expedition';
import { DiscardPile } from './DiscardPile';
import { getAIMove, startNewGame } from '@/api/utils';
import { GameResult } from './GameResult';
import { Deck } from './Deck';
import { useRouter } from 'next/navigation';

interface GameBoardProps {
  gameState: GameState;
  onGameAction: (action: GameAction) => void;
}

export const GameBoard = ({ gameState, onGameAction }: GameBoardProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sounds, setSounds] = useState<{
    playCard: HTMLAudioElement | null;
    drawCard: HTMLAudioElement | null;
    discard: HTMLAudioElement | null;
  }>({ playCard: null, drawCard: null, discard: null });
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setSounds({
        playCard: new Audio('/sounds/play-card.mp3'),
        drawCard: new Audio('/sounds/draw-card.mp3'),
        discard: new Audio('/sounds/discard.mp3'),
      });
    }
  }, [isClient]);

  const playSound = useCallback((type: 'playCard' | 'drawCard' | 'discard') => {
    if (sounds && sounds[type]) {
      sounds[type]?.play().catch(() => {});
    }
  }, [sounds]);

  const humanPlayer = gameState.players.find(p => p.type === 'HUMAN')!;
  const aiPlayer = gameState.players.find(p => p.type === 'AI')!;

  useEffect(() => {
    if (!isClient) return;

    const handleAITurn = async () => {
      if (
        gameState.currentPlayerIndex === 1 &&
        !gameState.isAIThinking &&
        gameState.gamePhase === 'PLAY' &&
        aiPlayer.hand.length > 0
      ) {
        console.log('AI Turn Start - Hand Size:', aiPlayer.hand.length);
        onGameAction({ type: 'START_AI_TURN' });

        try {
          const [cardIndex, playOrDiscard, drawSource] = await getAIMove(gameState);
          console.log('Backend AI Action:', { cardIndex, playOrDiscard, drawSource });

          if (cardIndex < 0 || cardIndex >= aiPlayer.hand.length) {
            console.error('Invalid cardIndex from backend:', cardIndex, 'Hand length:', aiPlayer.hand.length);
            throw new Error('Invalid card index');
          }
          if (![0, 1].includes(playOrDiscard)) {
            console.error('Invalid playOrDiscard from backend:', playOrDiscard);
            throw new Error('Invalid play/discard choice');
          }
          if (drawSource < 0 || drawSource > 6) {
            console.error('Invalid drawSource from backend:', drawSource);
            throw new Error('Invalid draw source');
          }

          const selectedCard = { ...aiPlayer.hand[cardIndex], isHidden: false };

          if (playOrDiscard === 0) {
            onGameAction({
              type: 'PLAY_CARD',
              payload: { card: selectedCard, color: selectedCard.color },
            });
            playSound('playCard');
          } else {
            onGameAction({ type: 'DISCARD_CARD', payload: selectedCard });
            onGameAction({
              type: 'SET_LAST_DISCARDED',
              payload: { color: selectedCard.color, cardId: String(selectedCard.id) },
            });
            playSound('discard');
          }

          await new Promise(resolve => setTimeout(resolve, 500));

          if (drawSource === 0) {
            if (gameState.deck.length > 0) {
              onGameAction({ type: 'DRAW_FROM_DECK' });
              playSound('drawCard');
            } else {
              console.warn('Deck empty, skipping draw');
            }
          } else {
            const color = COLORS[drawSource - 1];
            if (gameState.discardPiles[color].length > 0) {
              onGameAction({ type: 'DRAW_FROM_DISCARD', payload: color });
              playSound('drawCard');
            } else if (gameState.deck.length > 0) {
              console.warn(`Discard pile ${color} empty, drawing from deck`);
              onGameAction({ type: 'DRAW_FROM_DECK' });
              playSound('drawCard');
            } else {
              console.warn('No cards available to draw');
            }
          }

          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('AI Turn End - Hand Size:', aiPlayer.hand.length);
          onGameAction({ type: 'END_AI_TURN' });
        } catch (error) {
          console.error('Error during AI turn:', error);
          onGameAction({ type: 'END_AI_TURN' });
        }
      }
    };

    handleAITurn();
  }, [isClient, gameState, onGameAction, playSound, aiPlayer.hand]);

  const handleCardSelect = (card: CardType) => {
    if (gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'PLAY') {
      onGameAction({ type: 'SELECT_CARD', payload: card });
    }
  };

  const handleExpeditionPlay = (color: CardColor) => {
    if (
      gameState.selectedCard &&
      gameState.currentPlayerIndex === 0 &&
      gameState.gamePhase === 'PLAY'
    ) {
      onGameAction({
        type: 'PLAY_CARD',
        payload: { card: gameState.selectedCard, color },
      });
      playSound('playCard');
    }
  };

  const handleDiscard = (card: CardType) => {
    if (gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'PLAY') {
      onGameAction({ type: 'DISCARD_CARD', payload: card });
      onGameAction({
        type: 'SET_LAST_DISCARDED',
        payload: { color: card.color, cardId: String(card.id) },
      });
      playSound('discard');
    }
  };

  const handleDrawFromDiscard = (color: CardColor) => {
    if (gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'DRAW') {
      onGameAction({ type: 'DRAW_FROM_DISCARD', payload: color });
      playSound('drawCard');
    }
  };

  const handleDrawFromDeck = () => {
    if (gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'DRAW') {
      onGameAction({ type: 'DRAW_FROM_DECK' });
      playSound('drawCard');
    }
  };

  const handlePlayAgain = () => {
    onGameAction({ type: 'RESET_GAME' });
  };

  const handleStartNewGame = async () => {
    try {
      console.log('Starting new game...');
      const newGameState = await startNewGame();
      console.log('New Game State:', JSON.stringify(newGameState, null, 2));

      const allCardIds = [
        ...newGameState.players[0].hand.map(card => card.id),
        ...newGameState.players[1].hand.map(card => card.id),
        ...newGameState.deck.map(card => card.id),
      ];
      const uniqueIds = new Set(allCardIds);
      if (uniqueIds.size !== allCardIds.length) {
        console.error('Duplicate card IDs detected:', allCardIds);
      }

      onGameAction({ type: 'SET_GAME_STATE', payload: newGameState });
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Failed to start new game:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleHowToPlay = () => {
    router.push('/how-to-play');
    setIsMenuOpen(false);
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-900" />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 relative">
      <div className="h-full flex flex-col justify-between max-w-7xl mx-auto py-2 pr-12">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleMenu}
            className="px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl shadow-lg 
                     transition-all duration-300 font-medium text-gray-200 flex items-center gap-2.5
                     backdrop-blur-sm ring-1 ring-white/10 hover:ring-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Menu</span>
          </button>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-14 right-0 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl 
                       p-1.5 w-56 ring-1 ring-white/10"
            >
              <button
                onClick={handleStartNewGame}
                className="w-full text-left px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-all duration-200
                         text-gray-200 flex items-center gap-3 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Game</span>
              </button>
              <button
                onClick={handleHowToPlay}
                className="w-full text-left px-4 py-3 hover:bg-gray-700/50 rounded-lg transition-all duration-200
                         text-gray-200 flex items-center gap-3 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>How to Play</span>
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center mb-2">
          <PlayerHand
            cards={aiPlayer.hand.map(card => ({ ...card, isHidden: true }))}
            isActive={false}
            className="transform scale-[0.65]"
          />
        </div>

        <div className="flex-1 flex justify-end items-center gap-8 mr-24">
          <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                         backdrop-blur-sm rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl">
            <div className="flex gap-3">
              {COLORS.map(color => (
                <div key={color} className="flex flex-col items-center">
                  <Expedition
                    color={color}
                    cards={aiPlayer.expeditions[color]}
                    isActive={false}
                    className="transform scale-[0.55]"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {COLORS.map(color => (
                <DiscardPile
                  key={color}
                  color={color}
                  cards={gameState.discardPiles[color]}
                  isActive={
                    (gameState.gamePhase === 'DRAW' && gameState.currentPlayerIndex === 0) ||
                    (gameState.gamePhase === 'PLAY' && gameState.selectedCard?.color === color)
                  }
                  onCardDraw={() => handleDrawFromDiscard(color)}
                  onDiscard={
                    gameState.gamePhase === 'PLAY' && gameState.selectedCard?.color === color
                      ? () => handleDiscard(gameState.selectedCard!)
                      : undefined
                  }
                  className="transform scale-[0.55]"
                />
              ))}
            </div>

            <div className="flex gap-3">
              {COLORS.map(color => (
                <div key={color} className="flex flex-col items-center">
                  <Expedition
                    color={color}
                    cards={humanPlayer.expeditions[color]}
                    isActive={
                      gameState.gamePhase === 'PLAY' &&
                      gameState.currentPlayerIndex === 0 &&
                      gameState.selectedCard?.color === color
                    }
                    onCardPlay={() => handleExpeditionPlay(color)}
                    className="transform scale-[0.55]"
                  />
                </div>
              ))}
            </div>
          </div>

          <Deck
            cardsRemaining={gameState.deck.length}
            isActive={gameState.gamePhase === 'DRAW' && gameState.currentPlayerIndex === 0}
            onDraw={handleDrawFromDeck}
            className="transform scale-[0.85]"
          />
        </div>

        <div className="flex justify-center mt-2">
          <PlayerHand
            cards={humanPlayer.hand}
            selectedCard={gameState.selectedCard}
            onCardSelect={handleCardSelect}
            isActive={gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'PLAY'}
            className="transform scale-[0.65]"
          />
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              transition: { duration: 2, repeat: Infinity },
            }}
            className="px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm
                      rounded-full text-sm font-medium text-white/80 shadow-lg ring-1 ring-white/10"
          >
            {gameState.gamePhase === 'PLAY' ? 'Play or discard a card' : 'Draw a card'}
          </motion.div>
        </div>
      </div>

      {gameState.gamePhase === 'GAME_OVER' && (
        <GameResult players={gameState.players} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
};