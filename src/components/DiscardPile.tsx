import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, CardColor } from '@/types/game';
import { Card } from './Card';
import { cn } from '@/utils/cn';

interface DiscardPileProps {
  color: CardColor;
  cards: CardType[];
  onCardDraw?: () => void;
  onDiscard?: () => void;
  isActive?: boolean;
  className?: string;
}

export const DiscardPile = ({
  color,
  cards,
  onCardDraw,
  onDiscard,
  isActive,
  className
}: DiscardPileProps) => {
  const topCard = cards[cards.length - 1];
  
  const handleClick = () => {
    if (!isActive) return;
    if (onDiscard) {
      onDiscard();
    } else if (cards.length > 0 && onCardDraw) {
      onCardDraw();
    }
  };
  
  return (
    <div
      className={cn(
        'relative w-28 h-40 rounded-lg border-2 border-dashed border-white/20 transition-colors',
        isActive && 'border-white/50 bg-white/5 cursor-pointer hover:bg-white/10',
        className
      )}
      onClick={handleClick}
    >
      {/* Stack effect for cards underneath */}
      {cards.length > 1 && (
        <>
          <div className="absolute inset-0 bg-black/20 rounded-lg transform translate-y-1 translate-x-1" />
          <div className="absolute inset-0 bg-black/20 rounded-lg transform translate-y-0.5 translate-x-0.5" />
        </>
      )}

      {/* Top card */}
      <AnimatePresence mode="popLayout">
        {topCard && (
          <motion.div
            key={topCard.id}
            initial={{ opacity: 0, y: -20, rotateZ: 10 }}
            animate={{ opacity: 1, y: 0, rotateZ: 0 }}
            exit={{ opacity: 0, y: 20, rotateZ: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Card
              card={topCard}
              isPlayable={isActive}
              className="transform scale-90"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!topCard && (
        <div className="absolute inset-0 flex items-center justify-center text-white/40">
          {color}
        </div>
      )}

      {/* Card count */}
      {cards.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-1">
          <span className="text-xs text-white/80">{cards.length}</span>
        </div>
      )}
    </div>
  );
}; 