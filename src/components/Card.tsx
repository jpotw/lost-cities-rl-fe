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
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900
                       rounded-xl flex items-center justify-center relative overflow-hidden">
            {/* Modern mesh gradient effect */}
            <div className="absolute inset-0 bg-[radial-gradient(100%_50%_at_50%_0%,rgba(56,189,248,0.13)_0,rgba(56,189,248,0)_75%,rgba(56,189,248,0)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(100%_50%_at_50%_100%,rgba(236,72,153,0.13)_0,rgba(236,72,153,0)_75%,rgba(236,72,153,0)_100%)]" />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Center design */}
            <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 via-transparent to-pink-400/10 rounded-lg transform rotate-45" />
                <div className="absolute inset-[2px] bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-900 rounded-lg transform rotate-45" />
                <div className="absolute inset-[3px] border border-white/10 rounded-lg transform rotate-45" />
                <div className="text-2xl font-light text-white/30 transform -rotate-45 bg-gradient-to-br from-sky-400/30 to-pink-400/30 bg-clip-text text-transparent">LC</div>
            </div>
            
            {/* Modern corner accents */}
            <div className="absolute top-3 left-3 w-8 h-8">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-white/20 to-transparent" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white/20 to-transparent" />
            </div>
            <div className="absolute top-3 right-3 w-8 h-8">
                <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-white/20 to-transparent" />
                <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-white/20 to-transparent" />
            </div>
            <div className="absolute bottom-3 left-3 w-8 h-8">
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-white/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-[2px] h-full bg-gradient-to-t from-white/20 to-transparent" />
            </div>
            <div className="absolute bottom-3 right-3 w-8 h-8">
                <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-white/20 to-transparent" />
                <div className="absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-t from-white/20 to-transparent" />
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