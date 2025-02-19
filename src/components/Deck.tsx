import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface DeckProps {
  cardsRemaining: number;
  isActive?: boolean;
  onDraw?: () => void;
  className?: string;
}

export const Deck = ({
  cardsRemaining,
  isActive,
  onDraw,
  className
}: DeckProps) => {
  return (
    <motion.div
      whileHover={isActive ? { scale: 1.05 } : {}}
      whileTap={isActive ? { scale: 0.95 } : {}}
      className={cn(
        'relative w-24 h-36 rounded-xl bg-gradient-to-br from-indigo-800 to-indigo-600 shadow-lg shadow-indigo-500/50',
        isActive ? 'cursor-pointer' : 'opacity-80 cursor-default',
        className
      )}
      onClick={isActive ? onDraw : undefined}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl font-bold text-white/90">
            {cardsRemaining}
          </span>
          <div className="text-xs font-medium text-white/70 mt-1">
            cards left
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 