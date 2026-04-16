import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full bg-muted border-2 border-transparent rounded-xl px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
