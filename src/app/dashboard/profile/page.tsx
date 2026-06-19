import { requireAdvertiser } from '@/lib/auth/require-advertiser';
import { createAdvertiserProfileAction } from '@/actions/advertiser';
import { getAllCities } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/badge';

export default async function ProfilePage() {
  const advertiser = await requireAdvertiser();
  const cities = await getAllCities();

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold">Profile</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={createAdvertiserProfileAction} className="space-y-4">
            <input type="hidden" name="account_type" value={advertiser.account_type} />
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" name="display_name" defaultValue={advertiser.display_name} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" name="whatsapp" defaultValue={advertiser.whatsapp ?? ''} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={advertiser.phone ?? ''} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="city_id">City</Label>
              <Select id="city_id" name="city_id" defaultValue={advertiser.city_id ?? ''} required className="mt-1">
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={advertiser.bio ?? ''} className="mt-1" />
            </div>
            <Button type="submit">Save Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
