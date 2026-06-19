import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent-gold" />
        <span className="font-display text-xl gold-gradient-text">HelloLilly Admin</span>
      </Link>
      {children}
    </div>
  );
}
