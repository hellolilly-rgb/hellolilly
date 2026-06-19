import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  accountType: z.enum(['independent', 'agency']),
  acceptTerms: z.literal(true, { message: 'You must accept the terms' }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});

export const advertiserProfileSchema = z.object({
  display_name: z.string().min(2, 'Name required').max(100),
  phone: z.string().optional(),
  whatsapp: z.string().min(10, 'WhatsApp number required'),
  city_id: z.string().uuid('Select a city'),
  bio: z.string().max(1000).optional(),
});

export const agencySchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
});

export const listingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  age: z.coerce.number().min(18).max(99),
  city_id: z.string().uuid(),
  area: z.string().max(200).optional(),
  services: z.array(z.string()).default([]),
  rates: z
    .array(z.object({ label: z.string(), amount: z.coerce.number().min(0) }))
    .default([]),
  contact_whatsapp: z.string().min(10),
});

export const reportSchema = z.object({
  listing_id: z.string().uuid(),
  reporter_email: z.string().email().optional().or(z.literal('')),
  reason: z.string().min(10, 'Please provide a detailed reason'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdvertiserProfileInput = z.infer<typeof advertiserProfileSchema>;
export type AgencyInput = z.infer<typeof agencySchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
