import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  const borders: Record<ToastType, string> = {
    success: 'border-emerald-500/40 bg-[#0d1814] text-emerald-200',
    error: 'border-red-500/40 bg-[#1c0f12] text-red-200',
    warning: 'border-amber-500/40 bg-[#1a140b] text-amber-200',
    info: 'border-sky-500/40 bg-[#0e1622] text-sky-200'
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-auto max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom-3 ${borders[toast.type]}`}
    >
      <div className="pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 space-y-0.5">
        <p className="text-xs sm:text-sm font-semibold font-mono tracking-tight text-white">
          {toast.message}
        </p>
        {toast.description && (
          <p className="text-xs text-neutral-300 font-sans leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dispensar notificação"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
