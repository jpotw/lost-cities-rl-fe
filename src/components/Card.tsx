import { motion } from 'framer-motion';
import { Card as CardType } from '@/types/game';
import { cn } from '@/utils/cn';

interface CardProps {
    card: CardType;
    isPlayable?: boolean;
    onClick?: () => void;
    className?: string;
}

export const Card = ({ card, isPlayable, onClick, className }: CardProps) => {
    const colorClasses = {
        red: 'from-rose-500/90 to-red-600/90 shadow-red-500/30',
        blue: 'from-blue-500/90 to-indigo-600/90 shadow-blue-500/30',
        green: 'from-emerald-500/90 to-green-600/90 shadow-emerald-500/30',
        yellow: 'from-amber-400/90 to-yellow-500/90 shadow-yellow-500/30',
        white: 'from-slate-300/90 to-white/90 shadow-slate-400/30 !text-gray-800',
        purple: 'from-purple-500/90 to-violet-600/90 shadow-purple-500/30'
    };

    const cardBack = (
        <div className="w-full h-full bg-gradient-to-br from-gray-700/90 to-gray-800/90 
                       rounded-xl flex items-center justify-center relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-2 border-2 border-white/5 rounded-lg" />
            <div className="absolute inset-4 border border-white/5 rounded-lg rotate-45" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
            
            {/* Center emblem */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 
                          w-12 h-12 rounded-full flex items-center justify-center
                          ring-1 ring-white/10">
                <div className="text-2xl text-white/30">♠</div>
            </div>
        </div>
    );

    const cardContent = card.isHidden ? cardBack : (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Top-left mini value */}
            <div className="absolute top-3 left-3 text-sm font-medium opacity-90">
                {card.value === 'HS' ? '🤝' : card.value}
            </div>
            
            {/* Center value */}
            <div className="text-5xl font-bold">
                {card.value === 'HS' ? '🤝' : card.value}
            </div>
            
            {/* Bottom-right mini value */}
            <div className="absolute bottom-3 right-3 text-sm font-medium opacity-90 rotate-180">
                {card.value === 'HS' ? '🤝' : card.value}
            </div>

            {/* Decorative lines */}
            <div className="absolute inset-4 border-2 border-current opacity-10 rounded-lg" />
        </div>
    );

    if (isPlayable) {
        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn(
                    'w-28 h-40 rounded-xl bg-gradient-to-br backdrop-blur-sm',
                    'flex flex-col items-center justify-center',
                    'ring-1 ring-white/10 shadow-lg',
                    'font-bold transition-all duration-200',
                    !card.isHidden && colorClasses[card.color],
                    'cursor-pointer hover:shadow-xl',
                    className
                )}
                onClick={onClick}
            >
                {cardContent}
            </motion.div>
        );
    }

    return (
        <div
            className={cn(
                'w-28 h-40 rounded-xl bg-gradient-to-br backdrop-blur-sm',
                'flex flex-col items-center justify-center',
                'ring-1 ring-white/10 shadow-lg',
                'font-bold transition-all duration-200',
                !card.isHidden && colorClasses[card.color],
                'opacity-75 saturate-50 cursor-default',
                className
            )}
        >
            {cardContent}
        </div>
    );
}; 