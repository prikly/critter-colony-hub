import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'google';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    const base =
      'font-heading font-bold rounded-2xl transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2 cursor-pointer select-none';

    const variants: Record<string, string> = {
      primary:
        'bg-primary text-primary-foreground shadow-card hover:shadow-elevated hover:brightness-110 [box-shadow:0_4px_20px_color-mix(in_oklch,var(--primary)_30%,transparent)]',
      secondary:
        'bg-card text-foreground border border-border shadow-card hover:shadow-elevated hover:border-primary/30',
      ghost:
        'text-foreground hover:bg-accent/80',
      google:
        'bg-card text-foreground font-body font-semibold border border-border shadow-card hover:shadow-elevated hover:border-primary/30',
    };

    const sizes: Record<string, string> = {
      sm: 'px-4 py-2 text-sm rounded-xl',
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
