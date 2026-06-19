import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { ListingGrid } from '@/components/listings/listing-card';
import { getCityBySlug, getActiveListings } from '@/lib/queries';

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  return { title: city ? `Escorts in ${city.name}` : 'City' };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const listings = await getActiveListings({ cityId: city.id });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-sm text-accent-gold uppercase tracking-widest">Browse</p>
        <h1 className="mt-2 font-display text-4xl font-semibold flex items-center gap-2">
          <MapPin className="h-8 w-8 text-accent-gold" />
          {city.name}
        </h1>
        {city.states && (
          <p className="mt-1 text-text-muted">{city.states.name}</p>
        )}
      </div>
      <ListingGrid listings={listings} />
    </div>
  );
}
