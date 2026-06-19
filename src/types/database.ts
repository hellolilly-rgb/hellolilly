export type AccountType = 'independent' | 'agency';
export type AdvertiserStatus =
  | 'draft'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'suspended';
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled';
export type PaymentRequestStatus =
  | 'awaiting_payment'
  | 'proof_received'
  | 'activated'
  | 'rejected';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'action_taken';

export interface State {
  id: string;
  name: string;
  slug: string;
}

export interface City {
  id: string;
  state_id: string;
  name: string;
  slug: string;
  is_featured: boolean;
  states?: State;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  price_inr: number;
  billing_period_days: number;
  max_photos: number;
  max_listings: number;
  featured: boolean;
  priority_rank: number;
  is_active: boolean;
}

export interface AdvertiserProfile {
  id: string;
  user_id: string;
  account_type: AccountType;
  display_name: string;
  phone: string | null;
  whatsapp: string | null;
  city_id: string | null;
  bio: string | null;
  avatar_url: string | null;
  status: AdvertiserStatus;
  created_at: string;
  updated_at: string;
  cities?: City;
}

export interface Agency {
  id: string;
  owner_user_id: string;
  advertiser_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RateItem {
  label: string;
  amount: number;
}

export interface Listing {
  id: string;
  advertiser_id: string;
  agency_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  age: number | null;
  city_id: string;
  area: string | null;
  services: string[];
  rates: RateItem[];
  contact_whatsapp: string | null;
  is_active: boolean;
  is_featured: boolean;
  plan_tier: string;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  cities?: City;
  listing_media?: ListingMedia[];
  advertiser_profiles?: AdvertiserProfile;
  agencies?: Agency;
}

export interface ListingMedia {
  id: string;
  listing_id: string;
  storage_path: string;
  media_type: 'photo' | 'video';
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  advertiser_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: string | null;
  ends_at: string | null;
  activated_by_admin_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  plans?: Plan;
}

export interface PaymentRequest {
  id: string;
  advertiser_id: string;
  plan_id: string;
  reference_code: string;
  status: PaymentRequestStatus;
  whatsapp_thread_hint: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  plans?: Plan;
}

export interface VerificationSubmission {
  id: string;
  advertiser_id: string;
  video_path: string;
  status: VerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface ListingReport {
  id: string;
  listing_id: string;
  reporter_email: string | null;
  reason: string;
  status: ReportStatus;
  created_at: string;
  listings?: Listing;
}
