import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, CardColor, GameState } from '@/types/game';
import { COLORS } from '@/utils/gameUtils';
import { GameAction } from '@/reducers/gameReducer';
import { makeAIMove } from '@/utils/aiUtils';
import { PlayerHand } from './PlayerHand';
import { Expedition } from './Expedition';
import { DiscardPile } from './DiscardPile';
import { cn } from '@/utils/cn';

interface GameBoardProps {
  gameState: GameState;
  onGameAction: (action: GameAction) => void;
}

export const GameBoard = ({ gameState, onGameAction }: GameBoardProps) => {
  const [isClient, setIsClient] = useState(false);
  const [sounds, setSounds] = useState<{
    playCard: HTMLAudioElement | null;
    drawCard: HTMLAudioElement | null;
    discard: HTMLAudioElement | null;
  }>({ playCard: null, drawCard: null, discard: null });

  // Mark component as client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize sounds on client side only
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

  // Always keep human player at bottom and AI at top
  const humanPlayer = gameState.players.find(p => p.type === 'HUMAN')!;
  const aiPlayer = gameState.players.find(p => p.type === 'AI')!;

  // Handle AI turn on client side only
  useEffect(() => {
    if (!isClient) return;

    const handleAITurn = async () => {
      if (gameState.currentPlayerIndex === 1 && !gameState.isAIThinking && gameState.gamePhase !== 'GAME_OVER') {
        onGameAction({ type: 'START_AI_TURN' });

        try {
          const aiState = await makeAIMove(gameState, 1);

          if (aiState.gamePhase === 'DRAW') {
            // Apply the AI's play move by comparing the states
            const playedCard = gameState.players[1].hand.find(c => 
              !aiState.players[1].hand.some(ac => ac.id === c.id)
            );

            if (!playedCard) return;

            // Check if card was played to expedition or discarded
            const wasPlayedToExpedition = Object.values(aiState.players[1].expeditions).some(exp =>
              exp.some(c => c.id === playedCard.id)
            );

            if (wasPlayedToExpedition) {
              onGameAction({
                type: 'PLAY_CARD',
                payload: { 
                  card: { ...playedCard, isHidden: false },
                  color: playedCard.color 
                }
              });
              playSound('playCard');
            } else {
              onGameAction({ 
                type: 'DISCARD_CARD', 
                payload: { ...playedCard, isHidden: false }
              });
              onGameAction({ 
                type: 'SET_LAST_DISCARDED', 
                payload: { 
                  color: playedCard.color, 
                  cardId: playedCard.id 
                }
              });
              playSound('discard');
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            // Make draw choice on client side only
            if (Math.random() > 0.5 && Object.values(gameState.discardPiles).some(pile => pile.length > 0)) {
              const availableColors = Object.entries(gameState.discardPiles)
                .filter(([color, pile]) => {
                  if (pile.length === 0) return false;
                  const topCard = pile[pile.length - 1];
                  if (typeof topCard.value === 'number' && 
                    topCard.value < 4 && 
                    aiPlayer.expeditions[color as CardColor].length === 0) {
                    return false;
                  }
                  return !(gameState.lastDiscarded && 
                    gameState.lastDiscarded.color === color && 
                    gameState.lastDiscarded.cardId === topCard.id);
                })
                .map(([color]) => color as CardColor);

              if (availableColors.length > 0) {
                const priorityColors = availableColors.filter(color => 
                  aiPlayer.expeditions[color].length > 0
                );
                const randomColor = priorityColors.length > 0
                  ? priorityColors[Math.floor(Math.random() * priorityColors.length)]
                  : availableColors[Math.floor(Math.random() * availableColors.length)];
                onGameAction({ type: 'DRAW_FROM_DISCARD', payload: randomColor });
              } else {
                onGameAction({ type: 'DRAW_FROM_DECK' });
              }
            } else {
              onGameAction({ type: 'DRAW_FROM_DECK' });
            }
            playSound('drawCard');

            await new Promise(resolve => setTimeout(resolve, 500));
            onGameAction({ type: 'END_AI_TURN' });
          }
        } catch (error) {
          console.error('Error during AI turn:', error);
          onGameAction({ type: 'END_AI_TURN' });
        }
      }
    };

    handleAITurn();
  }, [isClient, gameState, onGameAction, aiPlayer.expeditions, playSound]);

  const handleCardSelect = (card: CardType) => {
    console.log('Card selected:', card);
    if (gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'PLAY') {
      onGameAction({ type: 'SELECT_CARD', payload: card });
    }
  };

  const handleExpeditionPlay = (color: CardColor) => {
    if (gameState.selectedCard && gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'PLAY') {
      onGameAction({ 
        type: 'PLAY_CARD', 
        payload: { card: gameState.selectedCard, color } 
      });
      playSound('playCard');
    }
  };

  const handleDiscard = (card: CardType) => {
    if (gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'PLAY') {
      onGameAction({ type: 'DISCARD_CARD', payload: card });
      onGameAction({ 
        type: 'SET_LAST_DISCARDED', 
        payload: { color: card.color, cardId: card.id }
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

  // Only render client-side content after hydration
  if (!isClient) {
    return <div className="min-h-screen bg-gray-900" />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 relative">
      {/* Game board */}
      <div className="h-full flex flex-col justify-between max-w-7xl mx-auto py-2 pr-12">
        {/* AI area (always at top) */}
        <div className="flex justify-center mb-2">
          <PlayerHand
            cards={aiPlayer.hand.map(card => ({ ...card, isHidden: true }))}
            isActive={false}
            className="transform scale-[0.65]"
          />
        </div>

        <div className="flex-1 flex justify-end items-center gap-8 mr-24">
          {/* Shared expedition area */}
          <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                         backdrop-blur-sm rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl">
            {/* AI expeditions */}
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

            {/* Discard piles in the middle */}
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

            {/* Human player expeditions */}
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

          {/* Draw deck */}
          <motion.div 
            whileHover={gameState.gamePhase === 'DRAW' && gameState.currentPlayerIndex === 0 ? { scale: 1.01 } : {}}
            className={cn(
              'relative w-24 h-36 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700',
              'ring-1 ring-white/10 shadow-lg',
              gameState.gamePhase === 'DRAW' && gameState.currentPlayerIndex === 0 && 
              'cursor-pointer hover:shadow-xl hover:from-gray-700 hover:to-gray-600'
            )}
            onClick={handleDrawFromDeck}
          >
            {/* Stack effect */}
            {gameState.deck.length > 0 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl transform translate-y-1 translate-x-1 -z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl transform translate-y-0.5 translate-x-0.5 -z-20" />
              </>
            )}

            {/* Card count */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white/40">
                {gameState.deck.length}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Human player area (always at bottom) */}
        <div className="flex justify-center mt-2">
          <PlayerHand
            cards={humanPlayer.hand}
            selectedCard={gameState.selectedCard}
            onCardSelect={handleCardSelect}
            isActive={gameState.currentPlayerIndex === 0 && gameState.gamePhase === 'PLAY'}
            className="transform scale-[0.65]"
          />
        </div>

        {/* Game phase indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              transition: { duration: 2, repeat: Infinity }
            }}
            className="px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm
                      rounded-full text-sm font-medium text-white/80 shadow-lg ring-1 ring-white/10"
          >
            {gameState.gamePhase === 'PLAY' ? 'Play or discard a card' : 'Draw a card'}
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 