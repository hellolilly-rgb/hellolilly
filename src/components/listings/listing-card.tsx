import Link from 'next/link';
import Image from 'next/image';
import { MapPin, BadgeCheck, Star } from 'lucide-react';
import { Badge, Card } from '@/components/ui/badge';
import { getPublicMediaUrl } from '@/lib/queries';
import type { Listing } from '@/types/database';

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.listing_media?.find((m) => m.is_cover) ?? listing.listing_media?.[0];
  const imageUrl = cover ? getPublicMediaUrl(cover.storage_path) : null;
  const city = listing.cities?.name ?? 'India';

  return (
    <Link href={`/listings/${listing.slug}`}>
      <Card className="group transition-all hover:border-border-glow hover:shadow-lg hover:shadow-accent-gold/5">
        <div className="relative aspect-[3/4] overflow-hidden bg-bg-elevated">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center shimmer">
              <span className="text-text-muted text-sm">No photo</span>
            </div>
          )}
          {listing.is_featured && (
            <div className="absolute left-2 top-2">
              <Badge variant="featured"><Star className="h-3 w-3" /> Featured</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-medium line-clamp-1">{listing.title}</h3>
            {listing.advertiser_profiles?.status === 'verified' && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-accent-gold" />
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <MapPin className="h-3 w-3" /> {city}{listing.area ? ` · ${listing.area}` : ''}
          </p>
          {listing.age && (
            <p className="mt-1 text-xs text-text-secondary">Age {listing.age}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}

export function ListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-12 text-center">
        <p className="text-text-muted">No listings found in this area yet.</p>
        <Link href="/auth/signup" className="mt-4 inline-block text-accent-gold hover:underline">
          Be the first to post →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
