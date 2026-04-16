import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Chip({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'bg-accent text-accent-foreground rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-card active:scale-95 border border-transparent hover:border-primary/20',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
