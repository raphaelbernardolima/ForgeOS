import React from 'react';

export type BadgeVariant = 'warning' | 'success' | 'info' | 'danger' | 'neutral' | 'accent';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    warning: {
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dotColor: 'bg-amber-400'
    },
    success: {
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dotColor: 'bg-emerald-400'
    },
    info: {
      bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      dotColor: 'bg-sky-400'
    },
    danger: {
      bg: 'bg-red-500/15 text-red-300 border-red-500/30',
      dotColor: 'bg-red-400'
    },
    accent: {
      bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      dotColor: 'bg-purple-400'
    },
    neutral: {
      bg: 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60',
      dotColor: 'bg-neutral-400'
    }
  };

  const sizeStyles = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const current = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border backdrop-blur-xs select-none ${current.bg} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dotColor}`} />}
      <span>{children}</span>
    </span>
  );
};
