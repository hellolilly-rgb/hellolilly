import { createClient } from '@/lib/supabase/server';
import type {
  AdvertiserProfile,
  Agency,
  City,
  Listing,
  Plan,
  Subscription,
  PaymentRequest,
  VerificationSubmission,
} from '@/types/database';

export async function getFeaturedCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cities')
    .select('*, states(*)')
    .eq('is_featured', true)
    .order('name');
  return (data ?? []) as City[];
}

export async function getAllCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cities')
    .select('*, states(*)')
    .order('name');
  return (data ?? []) as City[];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cities')
    .select('*, states(*)')
    .eq('slug', slug)
    .single();
  return data as City | null;
}

export async function getActiveListings(options?: {
  cityId?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Listing[]> {
  const supabase = await createClient();
  let query = supabase
    .from('listings')
    .select(
      '*, cities(*, states(*)), listing_media(*), advertiser_profiles(*), agencies(*)'
    )
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false });

  if (options?.cityId) query = query.eq('city_id', options.cityId);
  if (options?.featured) query = query.eq('is_featured', true);
  if (options?.limit) query = query.limit(options.limit);

  const { data } = await query;
  return (data ?? []) as Listing[];
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('listings')
    .select(
      '*, cities(*, states(*)), listing_media(*), advertiser_profiles(*), agencies(*)'
    )
    .eq('slug', slug)
    .single();
  return data as Listing | null;
}

export async function getAgencyBySlug(slug: string): Promise<Agency | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .single();
  return data as Agency | null;
}

export async function getAgencyListings(agencyId: string): Promise<Listing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('listings')
    .select('*, cities(*), listing_media(*)')
    .eq('agency_id', agencyId)
    .eq('is_active', true)
    .order('is_featured', { ascending: false });
  return (data ?? []) as Listing[];
}

export async function getCurrentAdvertiser(): Promise<AdvertiserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('advertiser_profiles')
    .select('*, cities(*)')
    .eq('user_id', user.id)
    .single();
  return data as AdvertiserProfile | null;
}

export async function getAdvertiserAgency(
  userId: string
): Promise<Agency | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('agencies')
    .select('*')
    .eq('owner_user_id', userId)
    .single();
  return data as Agency | null;
}

export async function getAdvertiserListings(
  advertiserId: string
): Promise<Listing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('listings')
    .select('*, cities(*), listing_media(*)')
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Listing[];
}

export async function getPlans(): Promise<Plan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('priority_rank');
  return (data ?? []) as Plan[];
}

export async function getActiveSubscription(
  advertiserId: string
): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('advertiser_id', advertiserId)
    .eq('status', 'active')
    .order('ends_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Subscription | null;
}

export async function getPaymentRequests(
  advertiserId: string
): Promise<PaymentRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('payment_requests')
    .select('*, plans(*)')
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false });
  return (data ?? []) as PaymentRequest[];
}

export async function getLatestVerification(
  advertiserId: string
): Promise<VerificationSubmission | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('verification_submissions')
    .select('*')
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as VerificationSubmission | null;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export function getPublicMediaUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${url}/storage/v1/object/public/listing-media/${path}`;
}
