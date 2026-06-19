import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { ListingGrid } from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import { getFeaturedCities, getActiveListings } from '@/lib/queries';

export const revalidate = 120;

export default async function HomePage() {
  const [cities, featuredListings, recentListings] = await Promise.all([
    getFeaturedCities(),
    getActiveListings({ featured: true, limit: 8 }),
    getActiveListings({ limit: 12 }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border-subtle">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-accent-rose/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm uppercase tracking-widest text-accent-gold">India&apos;s Premium Classifieds</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Verified listings.<br />
            <span className="gold-gradient-text">Trusted connections.</span>
          </h1>
          <p className="mt-6 max-w-lg text-text-secondary">
            Browse verified independent and agency profiles across India&apos;s top cities.
            Post your ad with video verification and flexible monthly plans.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/cities">Browse Cities <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/signup">Post Your Ad</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold">Featured Cities</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/cities/${city.slug}`}
              className="glass-card flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:border-border-glow hover:text-accent-gold"
            >
              <MapPin className="h-3.5 w-3.5" />
              {city.name}
            </Link>
          ))}
        </div>
      </section>

      {featuredListings.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h2 className="font-display text-2xl font-semibold">Featured Listings</h2>
          <div className="mt-6">
            <ListingGrid listings={featuredListings} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold">Latest Listings</h2>
        <div className="mt-6">
          <ListingGrid listings={recentListings} />
        </div>
      </section>
    </>
  );
}
