'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, Loader2Icon } from './icons';
import { cn } from '@/lib/utils';

interface StreamingStatusProps {
  isStreaming: boolean;
  isSubmitting: boolean;
  className?: string;
}

export function StreamingStatus({ 
  isStreaming, 
  isSubmitting, 
  className 
}: StreamingStatusProps) {
  if (!isStreaming && !isSubmitting) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50',
          'bg-background/80 backdrop-blur-sm border border-border rounded-full px-4 py-2',
          'flex items-center gap-2 shadow-lg',
          className
        )}
      >
        {isStreaming ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-primary"
            >
              <SparklesIcon size={16} />
            </motion.div>
            <span className="text-sm font-medium text-foreground">
              AI is thinking...
            </span>
          </>
        ) : (
          <>
            <div className="animate-spin text-primary">
              <Loader2Icon size={16} />
            </div>
            <span className="text-sm font-medium text-foreground">
              Sending message...
            </span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}