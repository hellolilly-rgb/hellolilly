'use client';

import { approveVerificationAction, rejectVerificationAction } from '@/actions/verification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, Card, CardContent } from '@/components/ui/badge';
import type { AdvertiserProfile, VerificationSubmission } from '@/types/database';

type Props = {
  submission: VerificationSubmission & {
    advertiser_profiles?: AdvertiserProfile;
    videoUrl: string | null;
  };
};

export function VerificationReviewCard({ submission }: Props) {
  async function approve() {
    await approveVerificationAction(submission.id);
  }

  async function reject(formData: FormData) {
    const reason = formData.get('reason') as string;
    await rejectVerificationAction(submission.id, reason);
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{submission.advertiser_profiles?.display_name}</p>
            <p className="text-sm text-text-muted capitalize">
              {submission.advertiser_profiles?.account_type}
            </p>
          </div>
          <Badge variant="warning">Pending</Badge>
        </div>
        {submission.videoUrl && (
          <video
            src={submission.videoUrl}
            controls
            className="w-full max-w-md rounded-lg bg-black"
          />
        )}
        <div className="flex flex-wrap gap-3">
          <form action={approve}>
            <Button type="submit" size="sm">Approve</Button>
          </form>
          <form action={reject} className="flex gap-2">
            <Input name="reason" placeholder="Rejection reason" required className="w-48" />
            <Button type="submit" variant="destructive" size="sm">Reject</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
