import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'creature';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-card rounded-2xl p-4 border border-border shadow-sm',
      creature:
        'bg-card rounded-2xl p-4 border border-border shadow-sm transition-all duration-200 hover:shadow-md',
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
