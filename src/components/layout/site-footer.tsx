import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold gold-gradient-text">HelloLilly</p>
            <p className="mt-2 text-sm text-text-muted">
              Premium verified classifieds across India.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li><Link href="/legal/terms" className="hover:text-accent-gold">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-accent-gold">Privacy Policy</Link></li>
              <li><Link href="/legal/age" className="hover:text-accent-gold">Age Verification</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Advertisers</p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li><Link href="/auth/signup" className="hover:text-accent-gold">Post an Ad</Link></li>
              <li><Link href="/dashboard/plans" className="hover:text-accent-gold">Plans & Pricing</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-border-subtle pt-6 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} HelloLilly. Adults 18+ only. All advertisers must be verified.
        </p>
      </div>
    </footer>
  );
}
