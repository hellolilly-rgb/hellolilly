import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/badge';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: pendingVerifications },
    { count: pendingPayments },
    { count: activeListings },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('verification_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payment_requests').select('*', { count: 'exact', head: true }).in('status', ['awaiting_payment', 'proof_received']),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('listing_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const stats = [
    { label: 'Pending Verifications', value: pendingVerifications ?? 0 },
    { label: 'Pending Payments', value: pendingPayments ?? 0 },
    { label: 'Active Listings', value: activeListings ?? 0 },
    { label: 'Pending Reports', value: pendingReports ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold">Admin Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-6">
              <p className="text-sm text-text-muted">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold gold-gradient-text">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
