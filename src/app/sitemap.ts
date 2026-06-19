import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hellolilly.in';
  const supabase = await createClient();

  const [{ data: cities }, { data: listings }] = await Promise.all([
    supabase.from('cities').select('slug, created_at'),
    supabase.from('listings').select('slug, updated_at').eq('is_active', true),
  ]);

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/cities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...(cities ?? []).map((c) => ({
      url: `${base}/cities/${c.slug}`,
      lastModified: new Date(c.created_at),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...(listings ?? []).map((l) => ({
      url: `${base}/listings/${l.slug}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
