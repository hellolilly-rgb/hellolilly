'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { reportSchema } from '@/lib/validations/schemas';

export async function reportListingAction(formData: FormData) {
  const parsed = reportSchema.safeParse({
    listing_id: formData.get('listing_id'),
    reporter_email: formData.get('reporter_email') || '',
    reason: formData.get('reason'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('listing_reports').insert({
    listing_id: parsed.data.listing_id,
    reporter_email: parsed.data.reporter_email || null,
    reason: parsed.data.reason,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function suspendAdvertiserAction(advertiserId: string) {
  const supabase = await createClient();
  await supabase
    .from('advertiser_profiles')
    .update({ status: 'suspended' })
    .eq('id', advertiserId);

  await supabase
    .from('listings')
    .update({ is_active: false })
    .eq('advertiser_id', advertiserId);

  revalidatePath('/admin/advertisers');
  return { success: true };
}

export async function toggleListingFeaturedAction(listingId: string, featured: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('listings')
    .update({ is_featured: featured })
    .eq('id', listingId);

  if (error) return { error: error.message };
  revalidatePath('/admin/listings');
  return { success: true };
}

export async function updateReportStatusAction(reportId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('listing_reports')
    .update({ status })
    .eq('id', reportId);

  if (error) return { error: error.message };
  revalidatePath('/admin/reports');
  return { success: true };
}

export async function updatePlanAction(planId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('plans')
    .update({
      name: formData.get('name') as string,
      price_inr: Number(formData.get('price_inr')),
      max_photos: Number(formData.get('max_photos')),
      max_listings: Number(formData.get('max_listings')),
    })
    .eq('id', planId);

  if (error) return { error: error.message };
  revalidatePath('/admin/plans');
  return { success: true };
}

export async function adminSignInAction(formData: FormData) {
  const { signInAction } = await import('@/actions/auth');
  return signInAction(formData);
}
