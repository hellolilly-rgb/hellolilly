import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function SiteHeader() {
  let user = null;
  let isAdminUser = false;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      isAdminUser = !!admin;
    }
  } catch {
    // Supabase not configured yet
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-base/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-gold" />
          <span className="font-display text-xl font-semibold gold-gradient-text">
            HelloLilly
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/cities" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
            Cities
          </Link>
          <Link href="/auth/signup" className="text-sm text-text-secondary hover:text-accent-gold transition-colors">
            Post Ad
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              {isAdminUser && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
