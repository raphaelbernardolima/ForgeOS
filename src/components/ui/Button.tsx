import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Variantes com propósito estrito de cor (UI Lei 3) e contraste WCAG AA (UI Lei 6)
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold shadow-md shadow-amber-500/20 focus-visible:ring-amber-400',
      secondary:
        'bg-[#1a1f2b] hover:bg-[#222938] active:bg-[#141822] text-neutral-100 border border-neutral-700/80 hover:border-neutral-600 focus-visible:ring-neutral-400',
      success:
        'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 font-bold shadow-md shadow-emerald-500/20 focus-visible:ring-emerald-400',
      danger:
        'bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 text-red-300 hover:text-red-200 border border-red-500/40 hover:border-red-500/60 focus-visible:ring-red-400',
      outline:
        'bg-transparent hover:bg-neutral-800/60 text-neutral-200 border border-neutral-700 hover:border-neutral-500 focus-visible:ring-neutral-400',
      ghost:
        'bg-transparent hover:bg-neutral-800/60 active:bg-neutral-800 text-neutral-300 hover:text-white focus-visible:ring-neutral-400'
    };

    // Tamanhos balanceados e confortáveis
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'py-1.5 px-3 text-xs gap-1.5 min-h-[36px]',
      md: 'py-2 px-4 text-xs sm:text-sm gap-2 min-h-[40px]',
      lg: 'py-2.5 px-5 text-sm sm:text-base gap-2.5 min-h-[46px]'
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-xl font-medium tracking-wide transition-all duration-150 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090b10] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
            <span>Processando...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
