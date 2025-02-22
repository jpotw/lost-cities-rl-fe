import { motion } from 'framer-motion';
import { Player } from '@/types/game';
import { calculateScore } from '@/utils/gameUtils';
import { cn } from '@/utils/cn';

interface GameResultProps {
  players: Player[];
  onPlayAgain: () => void;
}

export const GameResult = ({ players, onPlayAgain }: GameResultProps) => {
  const humanPlayer = players.find(p => p.type === 'HUMAN')!;
  const aiPlayer = players.find(p => p.type === 'AI')!;
  
  const humanScore = calculateScore(humanPlayer);
  const aiScore = calculateScore(aiPlayer);
  const hasWon = humanScore > aiScore;
  const isDraw = humanScore === aiScore;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-3xl 
                   shadow-2xl ring-1 ring-white/10 max-w-lg w-full mx-4"
      >
        <div className="text-center">
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "text-4xl font-bold mb-6",
              hasWon ? "text-emerald-400" : isDraw ? "text-amber-400" : "text-rose-400"
            )}
          >
            {hasWon ? "Victory!" : isDraw ? "It's a Draw!" : "Defeat"}
          </motion.h2>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-8"
          >
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl">
              <span className="text-white/90">Your Score</span>
              <span className="text-2xl font-bold text-white">{humanScore}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl">
              <span className="text-white/90">AI Score</span>
              <span className="text-2xl font-bold text-white">{aiScore}</span>
            </div>
          </motion.div>

          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 
                     rounded-full font-semibold shadow-lg hover:from-emerald-600 hover:to-emerald-700 
                     transition-colors duration-200"
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}; 