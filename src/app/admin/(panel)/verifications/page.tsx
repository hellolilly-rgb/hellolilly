import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { VerificationReviewCard } from '@/components/admin/verification-review-card';

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from('verification_submissions')
    .select('*, advertiser_profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const service = createServiceClient();
  const withUrls = await Promise.all(
    (submissions ?? []).map(async (sub) => {
      const { data: signed } = await service.storage
        .from('verification-videos')
        .createSignedUrl(sub.video_path, 3600);
      return { ...sub, videoUrl: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Verification Queue</h1>
      {!withUrls.length ? (
        <p className="text-text-muted">No pending verifications.</p>
      ) : (
        <div className="space-y-6">
          {withUrls.map((sub) => (
            <VerificationReviewCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
