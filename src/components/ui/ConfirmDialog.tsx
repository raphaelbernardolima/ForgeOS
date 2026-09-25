import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-[#121622] border border-neutral-700/80 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              variant === 'danger'
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>

          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
