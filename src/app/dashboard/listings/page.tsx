import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAdvertiser } from '@/lib/auth/require-advertiser';
import { getAdvertiserListings } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent } from '@/components/ui/badge';

export default async function ListingsPage() {
  const advertiser = await requireAdvertiser();
  const listings = await getAdvertiserListings(advertiser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">My Listings</h1>
        <Button asChild>
          <Link href="/dashboard/listings/new"><Plus className="h-4 w-4" /> New Listing</Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-text-muted">No listings yet.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/listings/new">Create your first listing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-sm text-text-muted">{listing.cities?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={listing.is_active ? 'verified' : 'warning'}>
                    {listing.is_active ? 'Live' : 'Draft'}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
