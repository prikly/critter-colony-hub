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
        'bg-accent text-accent-foreground rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-95',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
