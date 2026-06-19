'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  sendEmail,
  notifyAdmin,
  verificationSubmittedEmail,
  adminNewVerificationEmail,
} from '@/lib/email';

export async function submitVerificationVideoAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('video') as File;
  if (!file?.size) return { error: 'No video selected' };
  if (file.size > 50 * 1024 * 1024) return { error: 'Video must be under 50MB' };

  const { data: advertiser } = await supabase
    .from('advertiser_profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single();

  if (!advertiser) return { error: 'Complete your profile first' };

  const ext = file.name.split('.').pop() ?? 'mp4';
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('verification-videos')
    .upload(path, file, { upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { error: dbError } = await supabase.from('verification_submissions').insert({
    advertiser_id: advertiser.id,
    video_path: path,
    status: 'pending',
  });

  if (dbError) return { error: dbError.message };

  await supabase
    .from('advertiser_profiles')
    .update({ status: 'pending_verification' })
    .eq('id', advertiser.id);

  const email = verificationSubmittedEmail(advertiser.display_name);
  await sendEmail({ to: user.email!, ...email });
  await notifyAdmin(
    adminNewVerificationEmail(advertiser.display_name).subject,
    adminNewVerificationEmail(advertiser.display_name).html
  );

  revalidatePath('/dashboard/verification');
  return { success: true };
}

export async function approveVerificationAction(submissionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: submission } = await supabase
    .from('verification_submissions')
    .select('*, advertiser_profiles(*)')
    .eq('id', submissionId)
    .single();

  if (!submission) return { error: 'Submission not found' };

  await supabase
    .from('verification_submissions')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  await supabase
    .from('advertiser_profiles')
    .update({ status: 'verified' })
    .eq('id', submission.advertiser_id);

  const { data: freePlan } = await supabase
    .from('plans')
    .select('id, billing_period_days')
    .eq('slug', 'free')
    .single();

  if (freePlan) {
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + freePlan.billing_period_days);

    await supabase.from('subscriptions').insert({
      advertiser_id: submission.advertiser_id,
      plan_id: freePlan.id,
      status: 'active',
      starts_at: new Date().toISOString(),
      ends_at: endsAt.toISOString(),
      activated_by_admin_id: user.id,
      notes: 'Auto-activated free plan on verification',
    });
  }

  revalidatePath('/admin/verifications');
  return { success: true };
}

export async function rejectVerificationAction(submissionId: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: submission } = await supabase
    .from('verification_submissions')
    .select('advertiser_id')
    .eq('id', submissionId)
    .single();

  if (!submission) return { error: 'Submission not found' };

  await supabase
    .from('verification_submissions')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', submissionId);

  await supabase
    .from('advertiser_profiles')
    .update({ status: 'rejected' })
    .eq('id', submission.advertiser_id);

  revalidatePath('/admin/verifications');
  return { success: true };
}
