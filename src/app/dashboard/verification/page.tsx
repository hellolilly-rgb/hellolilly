import { requireAdvertiser } from '@/lib/auth/require-advertiser';
import { getLatestVerification } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { VideoUploadForm } from '@/components/verification/video-upload';

export default async function VerificationPage() {
  const advertiser = await requireAdvertiser();
  const latest = await getLatestVerification(advertiser.id);

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="font-display text-3xl font-semibold">Verification</h1>

      {latest && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">Latest submission:</span>
          <Badge
            variant={
              latest.status === 'approved'
                ? 'verified'
                : latest.status === 'rejected'
                  ? 'error'
                  : 'warning'
            }
          >
            {latest.status}
          </Badge>
        </div>
      )}

      {latest?.status === 'rejected' && latest.rejection_reason && (
        <p className="text-sm text-error">Reason: {latest.rejection_reason}</p>
      )}

      {(!latest || latest.status === 'rejected') && <VideoUploadForm />}

      {latest?.status === 'pending' && (
        <p className="text-text-muted">Your video is being reviewed. Please check back soon.</p>
      )}

      {latest?.status === 'approved' && (
        <p className="text-success">Your profile is verified!</p>
      )}
    </div>
  );
}
