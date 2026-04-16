import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'google';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    const base =
      'font-heading font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2';

    const variants: Record<string, string> = {
      primary:
        'bg-primary text-primary-foreground shadow-lg [box-shadow:0_4px_14px_color-mix(in_oklch,var(--primary)_40%,transparent)]',
      secondary: 'bg-card text-foreground border-2 border-border',
      ghost: 'text-foreground hover:bg-accent',
      google:
        'bg-card text-foreground font-body font-semibold border-2 border-border',
    };

    const sizes: Record<string, string> = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
