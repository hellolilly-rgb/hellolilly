import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  List,
  Shield,
  CreditCard,
  LogOut,
  Building2,
} from 'lucide-react';
import { signOutAction } from '@/actions/auth';
import { getCurrentAdvertiser } from '@/lib/queries';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/listings', label: 'Listings', icon: List },
  { href: '/dashboard/verification', label: 'Verification', icon: Shield },
  { href: '/dashboard/plans', label: 'Plans', icon: CreditCard },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const advertiser = await getCurrentAdvertiser();

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-24 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-accent-gold transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          {advertiser?.account_type === 'agency' && (
            <Link
              href="/dashboard/agency"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-accent-gold"
            >
              <Building2 className="h-4 w-4" />
              Agency
            </Link>
          )}
          <form action={signOutAction} className="pt-4">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </form>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
