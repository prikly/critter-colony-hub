import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { Creature } from '@/lib/creatures';

const elementStyles: Record<Creature['element'], string> = {
  fire: 'bg-fire-bg text-fire border-fire/15',
  water: 'bg-water-bg text-water border-water/15',
  earth: 'bg-earth-bg text-earth border-earth/15',
  thunder: 'bg-thunder-bg text-thunder border-thunder/15',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  element?: Creature['element'];
  glow?: boolean;
}

export function Badge({ element, glow, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-heading uppercase tracking-wide border transition-colors duration-200',
        element ? elementStyles[element] : 'bg-accent text-accent-foreground border-border',
        glow && element && 'shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
