import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '@/types/game';
import { Card } from './Card';
import { cn } from '@/utils/cn';

interface PlayerHandProps {
  cards: CardType[];
  selectedCard?: CardType | null;
  onCardSelect?: (card: CardType) => void;
  isActive?: boolean;
  className?: string;
}

export const PlayerHand = ({
  cards,
  selectedCard,
  onCardSelect,
  isActive = true,
  className
}: PlayerHandProps) => {
  return (
    <motion.div
      className={cn('flex gap-4 items-center justify-center', className)}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card) => (
          <motion.div
            key={`card-${card.id}`} // Unique key based on card.id
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              card={card}
              isPlayable={isActive}
              onClick={() => onCardSelect?.(card)}
              className={cn(
                'transform transition-transform hover:scale-[1.02]',
                selectedCard?.id === card.id && 'ring-4 ring-white ring-offset-2 ring-offset-gray-900'
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};