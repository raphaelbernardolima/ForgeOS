import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div
      className={`p-8 sm:p-12 rounded-2xl bg-[#11141c] border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
        {icon}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-md leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 w-full sm:w-auto">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction} className="w-full sm:w-auto">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction} className="w-full sm:w-auto">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
