import { notFound } from 'next/navigation';
import Image from 'next/image';
import { requireAdvertiser } from '@/lib/auth/require-advertiser';
import { createClient } from '@/lib/supabase/server';
import {
  updateListingAction,
  uploadListingPhotoAction,
  deleteListingPhotoAction,
  publishListingAction,
  unpublishListingAction,
} from '@/actions/listings';
import { getAllCities, getPublicMediaUrl } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/badge';

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const advertiser = await requireAdvertiser();
  const supabase = await createClient();
  const cities = await getAllCities();

  const { data: listing } = await supabase
    .from('listings')
    .select('*, listing_media(*)')
    .eq('id', id)
    .eq('advertiser_id', advertiser.id)
    .single();

  if (!listing) notFound();

  async function update(formData: FormData) {
    'use server';
    await updateListingAction(id, formData);
  }

  async function uploadPhoto(formData: FormData) {
    'use server';
    await uploadListingPhotoAction(id, formData);
  }

  async function deletePhoto(formData: FormData) {
    'use server';
    const mediaId = formData.get('mediaId') as string;
    await deleteListingPhotoAction(mediaId, id);
  }

  async function publish() {
    'use server';
    await publishListingAction(id);
  }

  async function unpublish() {
    'use server';
    await unpublishListingAction(id);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Edit Listing</h1>
        {listing.is_active ? (
          <form action={unpublish}><Button variant="outline" size="sm">Unpublish</Button></form>
        ) : (
          <form action={publish}><Button size="sm">Publish</Button></form>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={update} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={listing.title} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" defaultValue={listing.age ?? ''} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="city_id">City</Label>
              <Select id="city_id" name="city_id" defaultValue={listing.city_id} required className="mt-1">
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <Input id="area" name="area" defaultValue={listing.area ?? ''} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="contact_whatsapp">WhatsApp</Label>
              <Input id="contact_whatsapp" name="contact_whatsapp" defaultValue={listing.contact_whatsapp ?? ''} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={listing.description ?? ''} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="services">Services</Label>
              <Input id="services" name="services" defaultValue={(listing.services as string[]).join(', ')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="rates">Rates JSON</Label>
              <Input id="rates" name="rates" defaultValue={JSON.stringify(listing.rates)} className="mt-1 font-mono text-xs" />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-medium">Photos</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {listing.listing_media?.map((media) => (
              <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden bg-bg-elevated">
                <Image
                  src={getPublicMediaUrl(media.storage_path)}
                  alt=""
                  fill
                  className="object-cover"
                />
                <form action={deletePhoto} className="absolute top-1 right-1">
                  <input type="hidden" name="mediaId" value={media.id} />
                  <Button type="submit" size="sm" variant="destructive" className="h-6 px-2 text-xs">×</Button>
                </form>
              </div>
            ))}
          </div>
          <form action={uploadPhoto}>
            <Input type="file" name="photo" accept="image/*" required />
            <Button type="submit" className="mt-2" variant="outline" size="sm">Upload Photo</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
