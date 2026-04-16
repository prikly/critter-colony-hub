import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'creature' | 'glass';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        'bg-card rounded-2xl p-4 border border-border shadow-card transition-all duration-300',
      creature:
        'bg-card rounded-2xl p-4 border border-border shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1',
      glass:
        'glass rounded-2xl p-4 border border-border/50 shadow-card transition-all duration-300',
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
