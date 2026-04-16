import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { Creature } from '@/lib/creatures';

const elementStyles: Record<Creature['element'], string> = {
  fire: 'bg-fire-bg text-fire',
  water: 'bg-water-bg text-water',
  earth: 'bg-earth-bg text-earth',
  thunder: 'bg-thunder-bg text-thunder',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  element?: Creature['element'];
}

export function Badge({ element, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-heading uppercase tracking-wide',
        element ? elementStyles[element] : 'bg-accent text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
