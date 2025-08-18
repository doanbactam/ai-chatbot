'use client';

import { motion } from 'framer-motion';
import { CheckIcon, ClockIcon, AlertCircleIcon } from './icons';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  status: 'idle' | 'streaming' | 'error' | 'success';
  className?: string;
  size?: 'sm' | 'md';
}

export function MessageStatus({ 
  status, 
  className, 
  size = 'md' 
}: MessageStatusProps) {
  const iconSize = {
    sm: 12,
    md: 14,
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
  }[size];

  const getStatusConfig = () => {
    switch (status) {
      case 'streaming':
        return {
          icon: ClockIcon,
          text: 'Streaming',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
        };
      case 'error':
        return {
          icon: AlertCircleIcon,
          text: 'Error',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
        };
      case 'success':
        return {
          icon: CheckIcon,
          text: 'Complete',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
        };
      default:
        return {
          icon: ClockIcon,
          text: 'Pending',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full',
        config.bgColor,
        textSize,
        className
      )}
    >
      <div className={config.color}>
        <IconComponent size={iconSize} />
      </div>
      <span className={cn('font-medium', config.color)}>
        {config.text}
      </span>
      
      {/* Animated indicator for streaming */}
      {status === 'streaming' && (
        <motion.div
          className="size-1.5 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}