# HelloLilly — India Classified Platform

Premium verified classified marketplace for India built with Next.js 15, Supabase, and Resend.

## Features

- **Independent & Agency** account types
- **Free & Premium** monthly plans with manual WhatsApp payment
- **Video selfie verification** with admin review queue
- **City-first browsing** across 19+ Indian cities
- **Admin dashboard** for verifications, payments, moderation
- **Midnight Luxe** design system

## Tech Stack

- Next.js 16 (App Router)
- Supabase (Auth, Postgres, Storage, RLS)
- Resend (transactional email)
- Tailwind CSS 4
- TypeScript

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_ADMIN_WHATSAPP=91XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=your-secret
```

### 3. Run Supabase migrations

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or apply `supabase/migrations/20260619120000_initial_schema.sql` via the Supabase SQL editor.

### 4. Create admin user

1. Sign up via `/auth/signup`
2. In Supabase SQL editor, add your user to admin:

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('YOUR_USER_UUID', 'admin@yourdomain.com');
```

### 5. Start dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push to GitHub and import in Vercel
2. Add all environment variables
3. Add cron job in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/expire-subscriptions",
    "schedule": "0 0 * * *"
  }]
}
```

## User Flows

### Advertiser
1. Age gate → Sign up (Independent/Agency)
2. Complete profile → Create listing
3. Upload verification video
4. Admin approves → Free plan auto-activated
5. Optional: Request Premium → WhatsApp payment → Admin activates

### Admin
- `/admin/verifications` — Review selfie videos
- `/admin/payments` — Activate paid subscriptions
- `/admin/listings` — Moderate and feature listings
- `/admin/reports` — Handle user reports

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `listing-media` | Public read | Listing photos |
| `verification-videos` | Private | Selfie verification |
| `payment-proofs` | Private | Optional payment screenshots |

## Legal

This platform includes age verification, terms of service, and moderation tools. Consult legal counsel before production launch in India.
