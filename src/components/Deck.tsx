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
        'relative w-24 h-36 rounded-xl overflow-hidden backdrop-blur-sm',
        'bg-gradient-to-br from-gray-900/90 via-slate-900/90 to-zinc-900/90',
        'shadow-lg shadow-black/20 ring-1 ring-white/10',
        isActive && 'cursor-pointer hover:ring-sky-500/20 hover:shadow-sky-500/10',
        !isActive && 'opacity-80 saturate-50',
        className
      )}
      onClick={isActive ? onDraw : undefined}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-pink-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />

      {/* Center emblem */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative w-14 h-14 flex items-center justify-center">
          {/* Emblem background */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-pink-500/20 rounded-xl transform rotate-45" />
          <div className="absolute inset-[1px] bg-gradient-to-br from-gray-900 to-slate-900 rounded-xl transform rotate-45" />
          
          {/* Emblem border */}
          <div className="absolute inset-0 rounded-xl transform rotate-45 ring-1 ring-inset ring-white/10" />
          
          {/* Logo */}
          <span className="relative text-xl font-light tracking-wider transform -rotate-45 bg-gradient-to-br from-sky-200 to-pink-200 bg-clip-text text-transparent">
            LC
          </span>
        </div>

        {/* Card count */}
        <div className="mt-2 text-base font-medium">
          <span className="bg-gradient-to-br from-white/70 to-white/50 bg-clip-text text-transparent">
            {cardsRemaining}
          </span>
        </div>
      </div>

      {/* Corner accents - top */}
      <div className="absolute top-0 left-0 w-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute top-0 right-0 w-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Corner accents - bottom */}
      <div className="absolute bottom-0 left-0 w-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 right-0 w-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Side accents */}
      <div className="absolute top-0 left-0 w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      <div className="absolute top-0 right-0 w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-[1px] h-12 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[1px] h-12 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
    </motion.div>
  );
}; 