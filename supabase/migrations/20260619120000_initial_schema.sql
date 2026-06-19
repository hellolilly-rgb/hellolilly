-- HelloLilly India Classified Platform Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admin helper schema
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, anon;

-- Admin users
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_users_select ON public.admin_users
  FOR SELECT TO authenticated
  USING (private.is_admin());

-- Geography
CREATE TABLE public.states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY states_public_read ON public.states FOR SELECT USING (true);
CREATE POLICY cities_public_read ON public.cities FOR SELECT USING (true);
CREATE POLICY states_admin_write ON public.states FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY cities_admin_write ON public.cities FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Plans
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  price_inr integer NOT NULL DEFAULT 0,
  billing_period_days integer NOT NULL DEFAULT 30,
  max_photos integer NOT NULL DEFAULT 3,
  max_listings integer NOT NULL DEFAULT 1,
  featured boolean NOT NULL DEFAULT false,
  priority_rank integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY plans_public_read ON public.plans FOR SELECT USING (is_active = true);
CREATE POLICY plans_admin_write ON public.plans FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());

-- Advertiser profiles
CREATE TYPE public.account_type AS ENUM ('independent', 'agency');
CREATE TYPE public.advertiser_status AS ENUM (
  'draft', 'pending_verification', 'verified', 'rejected', 'suspended'
);

CREATE TABLE public.advertiser_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type public.account_type NOT NULL,
  display_name text NOT NULL,
  phone text,
  whatsapp text,
  city_id uuid REFERENCES public.cities(id),
  bio text,
  avatar_url text,
  status public.advertiser_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.advertiser_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY advertiser_own_select ON public.advertiser_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_admin());

CREATE POLICY advertiser_own_insert ON public.advertiser_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY advertiser_own_update ON public.advertiser_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR private.is_admin())
  WITH CHECK (user_id = auth.uid() OR private.is_admin());

-- Agencies
CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  advertiser_id uuid NOT NULL REFERENCES public.advertiser_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY agencies_public_read ON public.agencies FOR SELECT USING (true);

CREATE POLICY agencies_owner_write ON public.agencies
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() OR private.is_admin())
  WITH CHECK (owner_user_id = auth.uid() OR private.is_admin());

-- Listings
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid NOT NULL REFERENCES public.advertiser_profiles(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  age integer CHECK (age >= 18 AND age <= 99),
  city_id uuid NOT NULL REFERENCES public.cities(id),
  area text,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  rates jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact_whatsapp text,
  is_active boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  plan_tier text NOT NULL DEFAULT 'free',
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX listings_city_active_idx ON public.listings(city_id, is_active, is_featured DESC);
CREATE INDEX listings_advertiser_idx ON public.listings(advertiser_id);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY listings_public_read ON public.listings
  FOR SELECT USING (
    (is_active = true AND EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = listings.advertiser_id AND ap.status = 'verified'
    ))
    OR EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = listings.advertiser_id AND ap.user_id = auth.uid()
    )
    OR private.is_admin()
  );

CREATE POLICY listings_owner_write ON public.listings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = listings.advertiser_id AND ap.user_id = auth.uid()
    ) OR private.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = listings.advertiser_id AND ap.user_id = auth.uid()
    ) OR private.is_admin()
  );

-- Listing media
CREATE TABLE public.listing_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video')),
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY listing_media_public_read ON public.listing_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_media.listing_id AND l.is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.advertiser_profiles ap ON ap.id = l.advertiser_id
      WHERE l.id = listing_media.listing_id AND ap.user_id = auth.uid()
    )
    OR private.is_admin()
  );

CREATE POLICY listing_media_owner_write ON public.listing_media
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.advertiser_profiles ap ON ap.id = l.advertiser_id
      WHERE l.id = listing_media.listing_id AND ap.user_id = auth.uid()
    ) OR private.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.advertiser_profiles ap ON ap.id = l.advertiser_id
      WHERE l.id = listing_media.listing_id AND ap.user_id = auth.uid()
    ) OR private.is_admin()
  );

-- Subscriptions
CREATE TYPE public.subscription_status AS ENUM ('pending', 'active', 'expired', 'cancelled');

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid NOT NULL REFERENCES public.advertiser_profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  status public.subscription_status NOT NULL DEFAULT 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  activated_by_admin_id uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_owner_read ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = subscriptions.advertiser_id AND ap.user_id = auth.uid()
    ) OR private.is_admin()
  );

CREATE POLICY subscriptions_admin_write ON public.subscriptions
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY subscriptions_owner_insert ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = subscriptions.advertiser_id AND ap.user_id = auth.uid()
    )
  );

-- Payment requests
CREATE TYPE public.payment_request_status AS ENUM (
  'awaiting_payment', 'proof_received', 'activated', 'rejected'
);

CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid NOT NULL REFERENCES public.advertiser_profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  reference_code text NOT NULL UNIQUE,
  status public.payment_request_status NOT NULL DEFAULT 'awaiting_payment',
  whatsapp_thread_hint text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_requests_owner_read ON public.payment_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = payment_requests.advertiser_id AND ap.user_id = auth.uid()
    ) OR private.is_admin()
  );

CREATE POLICY payment_requests_owner_insert ON public.payment_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = payment_requests.advertiser_id AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY payment_requests_admin_update ON public.payment_requests
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Verification submissions
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.verification_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id uuid NOT NULL REFERENCES public.advertiser_profiles(id) ON DELETE CASCADE,
  video_path text NOT NULL,
  status public.verification_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY verification_owner_read ON public.verification_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = verification_submissions.advertiser_id AND ap.user_id = auth.uid()
    ) OR private.is_admin()
  );

CREATE POLICY verification_owner_insert ON public.verification_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.advertiser_profiles ap
      WHERE ap.id = verification_submissions.advertiser_id AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY verification_admin_update ON public.verification_submissions
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Listing reports
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'action_taken');

CREATE TABLE public.listing_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_email text,
  reason text NOT NULL,
  status public.report_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY reports_public_insert ON public.listing_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY reports_admin_read ON public.listing_reports
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY reports_admin_update ON public.listing_reports
  FOR UPDATE TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('listing-media', 'listing-media', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('verification-videos', 'verification-videos', false, 52428800, ARRAY['video/mp4','video/webm','video/quicktime']),
  ('payment-proofs', 'payment-proofs', false, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY listing_media_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-media');

CREATE POLICY listing_media_owner_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY listing_media_owner_manage ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY listing_media_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'listing-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY verification_videos_owner_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'verification-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY verification_videos_owner_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'verification-videos' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR private.is_admin()
    )
  );

CREATE POLICY verification_videos_admin_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'verification-videos' AND private.is_admin());

-- Seed plans
INSERT INTO public.plans (slug, name, price_inr, billing_period_days, max_photos, max_listings, featured, priority_rank)
VALUES
  ('free', 'Free', 0, 30, 3, 1, false, 0),
  ('premium', 'Premium', 999, 30, 15, 10, true, 10)
ON CONFLICT (slug) DO NOTHING;

-- Seed Indian states and cities
INSERT INTO public.states (name, slug) VALUES
  ('Maharashtra', 'maharashtra'),
  ('Delhi', 'delhi'),
  ('Karnataka', 'karnataka'),
  ('Telangana', 'telangana'),
  ('Tamil Nadu', 'tamil-nadu'),
  ('Gujarat', 'gujarat'),
  ('West Bengal', 'west-bengal'),
  ('Rajasthan', 'rajasthan'),
  ('Uttar Pradesh', 'uttar-pradesh'),
  ('Punjab', 'punjab'),
  ('Kerala', 'kerala'),
  ('Haryana', 'haryana')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cities (state_id, name, slug, is_featured)
SELECT s.id, c.name, c.slug, c.is_featured
FROM (VALUES
  ('maharashtra', 'Mumbai', 'mumbai', true),
  ('maharashtra', 'Pune', 'pune', true),
  ('delhi', 'New Delhi', 'new-delhi', true),
  ('delhi', 'Gurgaon', 'gurgaon', true),
  ('karnataka', 'Bangalore', 'bangalore', true),
  ('karnataka', 'Mysore', 'mysore', false),
  ('telangana', 'Hyderabad', 'hyderabad', true),
  ('tamil-nadu', 'Chennai', 'chennai', true),
  ('tamil-nadu', 'Coimbatore', 'coimbatore', false),
  ('gujarat', 'Ahmedabad', 'ahmedabad', true),
  ('gujarat', 'Surat', 'surat', false),
  ('west-bengal', 'Kolkata', 'kolkata', true),
  ('rajasthan', 'Jaipur', 'jaipur', true),
  ('rajasthan', 'Udaipur', 'udaipur', false),
  ('uttar-pradesh', 'Lucknow', 'lucknow', true),
  ('uttar-pradesh', 'Noida', 'noida', true),
  ('punjab', 'Chandigarh', 'chandigarh', true),
  ('kerala', 'Kochi', 'kochi', true),
  ('haryana', 'Faridabad', 'faridabad', false)
) AS c(state_slug, name, slug, is_featured)
JOIN public.states s ON s.slug = c.state_slug
ON CONFLICT (slug) DO NOTHING;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER advertiser_profiles_updated_at
  BEFORE UPDATE ON public.advertiser_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER agencies_updated_at
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
