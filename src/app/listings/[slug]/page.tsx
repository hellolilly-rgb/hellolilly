import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, BadgeCheck, Star } from 'lucide-react';
import { getListingBySlug, getPublicMediaUrl } from '@/lib/queries';
import { buildListingContactLink } from '@/lib/whatsapp/links';
import { reportListingAction } from '@/actions/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils';
import type { RateItem } from '@/types/database';

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  return { title: listing?.title ?? 'Listing' };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || !listing.is_active) notFound();

  const photos = listing.listing_media?.filter((m) => m.media_type === 'photo') ?? [];
  const cover = photos.find((p) => p.is_cover) ?? photos[0];
  const rates = (listing.rates ?? []) as RateItem[];
  const services = (listing.services ?? []) as string[];
  const whatsapp = listing.contact_whatsapp ?? '';

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-bg-elevated">
            {cover ? (
              <Image
                src={getPublicMediaUrl(cover.storage_path)}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">No photo</div>
            )}
            {listing.is_featured && (
              <div className="absolute left-3 top-3">
                <Badge variant="featured"><Star className="h-3 w-3" /> Featured</Badge>
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={getPublicMediaUrl(photo.storage_path)} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-semibold">{listing.title}</h1>
              {listing.advertiser_profiles?.status === 'verified' && (
                <BadgeCheck className="h-5 w-5 text-accent-gold" />
              )}
            </div>
            <p className="mt-2 flex items-center gap-1 text-text-muted">
              <MapPin className="h-4 w-4" />
              {listing.cities?.name}{listing.area ? ` · ${listing.area}` : ''}
            </p>
            {listing.age && <p className="text-sm text-text-secondary">Age {listing.age}</p>}
          </div>

          {listing.description && (
            <p className="text-text-secondary leading-relaxed">{listing.description}</p>
          )}

          {services.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Services</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {services.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {rates.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Rates</h2>
              <div className="mt-2 space-y-1">
                {rates.map((r) => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span>{r.label}</span>
                    <span className="font-medium text-accent-gold">{formatINR(r.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {whatsapp && (
            <Button variant="whatsapp" size="lg" className="w-full" asChild>
              <a
                href={buildListingContactLink(whatsapp, listing.title)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact on WhatsApp
              </a>
            </Button>
          )}

          {listing.agencies && (
            <p className="text-sm text-text-muted">
              Agency: <span className="text-accent-gold">{listing.agencies.name}</span>
            </p>
          )}
        </div>
      </div>

      <Card className="mt-12">
        <CardContent className="pt-6">
          <h2 className="font-medium mb-4">Report this listing</h2>
          <form action={reportListingAction} className="space-y-3 max-w-md">
            <input type="hidden" name="listing_id" value={listing.id} />
            <div>
              <Label htmlFor="reporter_email">Your email (optional)</Label>
              <Input id="reporter_email" name="reporter_email" type="email" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" name="reason" required minLength={10} className="mt-1" />
            </div>
            <Button type="submit" variant="outline" size="sm">Submit Report</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
