import { notFound } from 'next/navigation';
import { getAgencyBySlug, getAgencyListings } from '@/lib/queries';
import { ListingGrid } from '@/components/listings/listing-card';

export const revalidate = 120;

export default async function AgencyPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agency = await getAgencyBySlug(slug);
  if (!agency) notFound();

  const listings = await getAgencyListings(agency.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">{agency.name}</h1>
      {agency.description && (
        <p className="mt-4 max-w-2xl text-text-secondary">{agency.description}</p>
      )}
      <div className="mt-10">
        <h2 className="text-xl font-medium mb-6">Listings</h2>
        <ListingGrid listings={listings} />
      </div>
    </div>
  );
}
