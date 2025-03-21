import { motion } from 'framer-motion';
import { Card as CardType, CardColor } from '@/types/game';
import { Card } from './Card';
import { cn } from '@/utils/cn';

interface ExpeditionProps {
  color: CardColor;
  cards: CardType[];
  isActive?: boolean;
  onCardPlay?: () => void;
  className?: string;
}

const colorClasses = {
  RED: 'hover:bg-red-500/10',
  BLUE: 'hover:bg-blue-500/10',
  GREEN: 'hover:bg-green-500/10',
  YELLOW: 'hover:bg-yellow-500/10',
  WHITE: 'hover:bg-gray-400/10',
  PURPLE: 'hover:bg-purple-500/10'
};

export const Expedition = ({
  color,
  cards,
  isActive,
  onCardPlay,
  className
}: ExpeditionProps) => {
  return (
    <motion.div
      className={cn(
        'relative w-28 min-h-[10rem] rounded-xl transition-colors duration-200',
        isActive && 'cursor-pointer',
        isActive && colorClasses[color],
        className
      )}
      onClick={isActive ? onCardPlay : undefined}
      whileHover={undefined}
      whileTap={undefined}
    >
      {/* Empty state */}
      {cards.length === 0 && (
        <div className={cn(
          "absolute inset-0 border-2 border-dashed rounded-xl flex items-center justify-center",
          isActive ? `border-${color}-400/50 bg-${color}-500/5` : "border-white/10",
          "transition-colors duration-200"
        )}>
          <span className={cn(
            "text-sm tracking-wider uppercase",
            isActive ? `text-${color}-400/80` : "text-white/20"
          )}>
            {color}
          </span>
        </div>
      )}

      {/* Stacked cards */}
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute"
          initial={{ opacity: 0, y: -20, rotateZ: 10 }}
          animate={{
            opacity: 1,
            y: index * 30,
            zIndex: index,
            rotateZ: 0,
            scale: 0.9
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          <Card
            card={card}
            isPlayable={isActive}
            className="transform transition-all duration-200"
          />
        </motion.div>
      ))}

      {/* Score display */}
      {cards.length > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -right-2 -top-2 bg-gray-900/90 backdrop-blur-sm rounded-full px-2 py-1
                    text-xs font-medium ring-1 ring-white/20 shadow-lg"
        >
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {cards.length}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}; 