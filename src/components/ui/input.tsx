import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('text-sm font-medium text-text-secondary', className)} {...props} />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
