import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'verified' | 'featured' | 'warning' | 'error';
}) {
  const variants = {
    default: 'bg-bg-elevated text-text-secondary border-border-subtle',
    verified: 'bg-success/15 text-success border-success/30',
    featured: 'featured-ribbon text-bg-base border-transparent',
    warning: 'bg-warning/15 text-warning border-warning/30',
    error: 'bg-error/15 text-error border-error/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('glass-card rounded-xl overflow-hidden', className)}>{children}</div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5 border-b border-border-subtle', className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
