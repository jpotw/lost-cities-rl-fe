import { motion } from 'framer-motion';
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
      key="player-hand-container"
      className={cn(
        'flex gap-4 items-center justify-center',
        className
      )}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
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
    </motion.div>
  );
}; 