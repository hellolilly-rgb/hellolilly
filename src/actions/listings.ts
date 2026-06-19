'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listingSchema } from '@/lib/validations/schemas';
import { slugify } from '@/lib/utils';

async function getAdvertiserId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('advertiser_profiles')
    .select('id, status, account_type')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function createListingAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const advertiser = await getAdvertiserId(supabase, user.id);
  if (!advertiser) throw new Error('Complete your profile first');

  const servicesRaw = formData.get('services') as string;
  const ratesRaw = formData.get('rates') as string;

  const parsed = listingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    age: formData.get('age'),
    city_id: formData.get('city_id'),
    area: formData.get('area') || undefined,
    services: servicesRaw ? servicesRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
    rates: ratesRaw ? JSON.parse(ratesRaw) : [],
    contact_whatsapp: formData.get('contact_whatsapp'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  let agencyId: string | null = null;
  if (advertiser.account_type === 'agency') {
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_user_id', user.id)
      .single();
    agencyId = agency?.id ?? null;
  }

  const baseSlug = slugify(parsed.data.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      advertiser_id: advertiser.id,
      agency_id: agencyId,
      slug,
      ...parsed.data,
      is_active: false,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/listings');
  redirect(`/dashboard/listings/${listing.id}/edit`);
}

export async function updateListingAction(listingId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const servicesRaw = formData.get('services') as string;
  const ratesRaw = formData.get('rates') as string;

  const parsed = listingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    age: formData.get('age'),
    city_id: formData.get('city_id'),
    area: formData.get('area') || undefined,
    services: servicesRaw ? servicesRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
    rates: ratesRaw ? JSON.parse(ratesRaw) : [],
    contact_whatsapp: formData.get('contact_whatsapp'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const { error } = await supabase
    .from('listings')
    .update(parsed.data)
    .eq('id', listingId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/listings');
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
}

export async function uploadListingPhotoAction(listingId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const file = formData.get('photo') as File;
  if (!file?.size) throw new Error('No file selected');

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/${listingId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('listing-media')
    .upload(path, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { count } = await supabase
    .from('listing_media')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId);

  const { error: dbError } = await supabase.from('listing_media').insert({
    listing_id: listingId,
    storage_path: path,
    media_type: 'photo',
    sort_order: count ?? 0,
    is_cover: (count ?? 0) === 0,
  });

  if (dbError) throw new Error(dbError.message);

  revalidatePath(`/dashboard/listings/${listingId}/edit`);
}

export async function deleteListingPhotoAction(mediaId: string, listingId: string) {
  const supabase = await createClient();
  const { data: media } = await supabase
    .from('listing_media')
    .select('storage_path')
    .eq('id', mediaId)
    .single();

  if (media) {
    await supabase.storage.from('listing-media').remove([media.storage_path]);
    await supabase.from('listing_media').delete().eq('id', mediaId);
  }

  revalidatePath(`/dashboard/listings/${listingId}/edit`);
}

export async function publishListingAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: advertiser } = await supabase
    .from('advertiser_profiles')
    .select('id, status')
    .eq('user_id', user.id)
    .single();

  if (!advertiser || advertiser.status !== 'verified') {
    throw new Error('You must be verified before publishing');
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('advertiser_id', advertiser.id)
    .eq('status', 'active')
    .maybeSingle();

  const endsAt = sub?.ends_at ?? new Date(Date.now() + 30 * 86400000).toISOString();

  const { error } = await supabase
    .from('listings')
    .update({
      is_active: true,
      published_at: new Date().toISOString(),
      expires_at: endsAt,
      plan_tier: sub?.plans?.slug ?? 'free',
      is_featured: sub?.plans?.featured ?? false,
    })
    .eq('id', listingId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/listings');
  revalidatePath('/');
}

export async function unpublishListingAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('listings')
    .update({ is_active: false })
    .eq('id', listingId);

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/listings');
}
