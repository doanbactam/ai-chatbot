'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TypingIndicator({ className, size = 'md' }: TypingIndicatorProps) {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  const containerSize = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  }[size];

  return (
    <div className={cn('flex items-center', containerSize, className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'bg-muted-foreground/60 rounded-full',
            dotSize
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.4,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}