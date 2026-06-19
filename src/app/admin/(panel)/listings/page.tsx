import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { toggleListingFeaturedAction } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent } from '@/components/ui/badge';

export default async function AdminListingsPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from('listings')
    .select('*, cities(*), advertiser_profiles(*)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Listings</h1>
      <div className="space-y-3">
        {listings?.map((listing) => {
          async function toggleFeatured() {
            'use server';
            await toggleListingFeaturedAction(listing.id, !listing.is_featured);
          }

          return (
            <Card key={listing.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-sm text-text-muted">
                    {listing.cities?.name} · {listing.advertiser_profiles?.display_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={listing.is_active ? 'verified' : 'warning'}>
                    {listing.is_active ? 'Live' : 'Draft'}
                  </Badge>
                  {listing.is_featured && <Badge variant="featured">Featured</Badge>}
                  <form action={toggleFeatured}>
                    <Button size="sm" variant="outline">
                      {listing.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                  </form>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/listings/${listing.slug}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
