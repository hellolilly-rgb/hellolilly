import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdvertiserProfileAction } from '@/actions/advertiser';
import { getAllCities, getCurrentAdvertiser } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/badge';

export default async function OnboardingPage() {
  const existing = await getCurrentAdvertiser();
  if (existing) redirect('/dashboard');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const accountType = (user.user_metadata?.account_type as string) ?? 'independent';
  const cities = await getAllCities();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold">Complete Your Profile</h1>
      <Card>
        <CardHeader>
          <p className="text-sm text-text-muted capitalize">{accountType} account</p>
        </CardHeader>
        <CardContent>
          <form action={createAdvertiserProfileAction} className="space-y-4">
            <input type="hidden" name="account_type" value={accountType} />
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" name="display_name" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input id="whatsapp" name="whatsapp" required placeholder="91XXXXXXXXXX" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" className="mt-1" />
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
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea id="bio" name="bio" className="mt-1" />
            </div>
            <Button type="submit" className="w-full">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
