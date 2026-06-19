import { requireAdvertiser } from '@/lib/auth/require-advertiser';
import { getAllCities } from '@/lib/queries';
import { createListingAction } from '@/actions/listings';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/badge';

export default async function NewListingPage() {
  await requireAdvertiser();
  const cities = await getAllCities();

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold">New Listing</h1>
      <Card>
        <CardHeader><p className="text-sm text-text-muted">Basic details</p></CardHeader>
        <CardContent>
          <form action={createListingAction} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" min={18} max={99} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="city_id">City</Label>
              <Select id="city_id" name="city_id" required className="mt-1">
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="area">Area / Locality</Label>
              <Input id="area" name="area" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="contact_whatsapp">WhatsApp Contact</Label>
              <Input id="contact_whatsapp" name="contact_whatsapp" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="services">Services (comma separated)</Label>
              <Input id="services" name="services" placeholder="Dinner dates, Travel companion" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="rates">Rates (JSON)</Label>
              <Input
                id="rates"
                name="rates"
                placeholder='[{"label":"1 Hour","amount":5000}]'
                className="mt-1 font-mono text-xs"
              />
            </div>
            <Button type="submit" className="w-full">Create Listing</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
