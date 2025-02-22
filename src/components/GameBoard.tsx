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
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          const aiAction = await getAIMove(gameState); // Get the AI move from the API
            // Convert the action received from the API to your game action format
            const cardIndex = aiAction[0];
            const playOrDiscard = aiAction[1];  // 0 for play, 1 for discard
            const drawSource = aiAction[2];   // 0 for deck, 1-5 for discard piles
            const aiPlayer = gameState.players.find(p => p.type === 'AI');
            if (!aiPlayer) {
                console.error("AI player not found");
                return;
            }
            if (cardIndex >= aiPlayer.hand.length) {
                console.error("Invalid card index from AI");
                return;
            }
            const selectedCard = aiPlayer.hand[cardIndex];
            if (playOrDiscard === 0) {
                //play card
                onGameAction({
                    type: 'PLAY_CARD',
                    payload: {
                    card: { ...selectedCard, isHidden: false },
                    color: selectedCard.color
                    }
                });
                playSound('playCard');
            }
            else{
                //discard card
                onGameAction({
                    type: 'DISCARD_CARD',
                    payload: { ...selectedCard, isHidden: false }
                });
                onGameAction({
                    type: 'SET_LAST_DISCARDED',
                    payload: {
                    color: selectedCard.color,
                    cardId: String(selectedCard.id)
                    }
                });
                playSound('discard');
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            //draw
            if (drawSource === 0) {
                //draw from deck
                onGameAction({ type: 'DRAW_FROM_DECK' });

            }
            else{
                //draw from discard
                const color = COLORS[drawSource - 1]; // Convert index to color
                onGameAction({ type: 'DRAW_FROM_DISCARD', payload: color });
            }
            playSound('drawCard');
            await new Promise(resolve => setTimeout(resolve, 500));
            onGameAction({ type: 'END_AI_TURN' });

        } catch (error) {
          console.error('Error during AI turn:', error);
          onGameAction({ type: 'END_AI_TURN' });
        }
      }
    };
  
      handleAITurn();
    }, [isClient, gameState, onGameAction, playSound]);

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
        payload: { color: card.color, cardId: String(card.id) }
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
      const newGameState = await startNewGame();
      onGameAction({ type: 'SET_GAME_STATE', payload: newGameState });
    } catch (error) {
      console.error('Failed to start new game:', error);
    }
  };

  // Only render client-side content after hydration
  if (!isClient) {
    return <div className="min-h-screen bg-gray-900" />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 relative">
      {/* Game board */}
      <div className="h-full flex flex-col justify-between max-w-7xl mx-auto py-2">
        {/* Game controls - Toggle Menu */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg
                     flex items-center gap-2 transition-colors duration-200"
          >
            Menu
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg 
                       bg-gray-600 backdrop-blur-sm ring-1 ring-white/10"
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    handleStartNewGame();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Start New Game
                </button>
                <button
                  onClick={() => {
                    router.push('/how-to-play');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  How to Play
                </button>
              </div>
            </motion.div>
          )}
        </div>

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
          <Deck
            cardsRemaining={gameState.deck.length}
            isActive={gameState.gamePhase === 'DRAW' && gameState.currentPlayerIndex === 0}
            onDraw={handleDrawFromDeck}
            className="transform scale-[0.85]"
          />
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

      {/* Show game result screen when game is over */}
      {gameState.gamePhase === 'GAME_OVER' && (
        <GameResult 
          players={gameState.players}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}; 