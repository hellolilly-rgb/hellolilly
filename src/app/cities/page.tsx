import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getFeaturedCities, getAllCities } from '@/lib/queries';

export default async function CitiesPage() {
  const [featured, all] = await Promise.all([getFeaturedCities(), getAllCities()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">Browse by City</h1>
      <p className="mt-2 text-text-muted">Find verified listings across India</p>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-accent-gold">Featured Cities</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {featured.map((city) => (
            <Link
              key={city.id}
              href={`/cities/${city.slug}`}
              className="glass-card rounded-xl p-4 text-center transition-all hover:border-border-glow"
            >
              <MapPin className="mx-auto h-5 w-5 text-accent-gold mb-2" />
              <span className="text-sm font-medium">{city.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">All Cities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {all.map((city) => (
            <Link
              key={city.id}
              href={`/cities/${city.slug}`}
              className="rounded-full border border-border-subtle px-3 py-1.5 text-sm hover:border-accent-gold hover:text-accent-gold transition-colors"
            >
              {city.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
