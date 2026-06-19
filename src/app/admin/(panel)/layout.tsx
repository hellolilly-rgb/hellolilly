import Link from 'next/link';
import {
  LayoutDashboard,
  Shield,
  CreditCard,
  List,
  Users,
  MapPin,
  Flag,
  Settings,
} from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/verifications', label: 'Verifications', icon: Shield },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/listings', label: 'Listings', icon: List },
  { href: '/admin/advertisers', label: 'Advertisers', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/plans', label: 'Plans', icon: Settings },
  { href: '/admin/cities', label: 'Cities', icon: MapPin },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <p className="mb-4 text-xs uppercase tracking-widest text-accent-gold">Admin</p>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-accent-gold"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
