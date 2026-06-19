import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BadgeCheck, AlertCircle, Clock } from 'lucide-react';
import { requireAdvertiser } from '@/lib/auth/require-advertiser';
import { getActiveSubscription, getLatestVerification } from '@/lib/queries';
import { Badge, Card, CardContent } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const advertiser = await requireAdvertiser();
  const [subscription, verification] = await Promise.all([
    getActiveSubscription(advertiser.id),
    getLatestVerification(advertiser.id),
  ]);

  const statusBadge = {
    draft: { variant: 'warning' as const, label: 'Draft' },
    pending_verification: { variant: 'warning' as const, label: 'Pending Verification' },
    verified: { variant: 'verified' as const, label: 'Verified' },
    rejected: { variant: 'error' as const, label: 'Rejected' },
    suspended: { variant: 'error' as const, label: 'Suspended' },
  }[advertiser.status];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-text-muted">Welcome, {advertiser.display_name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-text-muted">Account Status</p>
            <div className="mt-2">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-text-muted">Current Plan</p>
            <p className="mt-2 font-medium">{subscription?.plans?.name ?? 'None'}</p>
            {subscription?.ends_at && (
              <p className="text-xs text-text-muted">Expires {formatDate(subscription.ends_at)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-text-muted">Account Type</p>
            <p className="mt-2 font-medium capitalize">{advertiser.account_type}</p>
          </CardContent>
        </Card>
      </div>

      {advertiser.status !== 'verified' && (
        <Card className="border-warning/30">
          <CardContent className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Verification required</p>
              <p className="text-sm text-text-muted mt-1">
                Upload a selfie video to verify your profile before publishing listings.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link href="/dashboard/verification">Upload Video</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {verification?.status === 'pending' && (
        <Card>
          <CardContent className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <p className="text-sm">Your verification video is under review.</p>
          </CardContent>
        </Card>
      )}

      {advertiser.status === 'verified' && (
        <Card className="border-success/30">
          <CardContent className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium">You&apos;re verified!</p>
              <Button className="mt-2" size="sm" asChild>
                <Link href="/dashboard/listings/new">Create Listing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
