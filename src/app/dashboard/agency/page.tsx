import { requireAdvertiser } from '@/lib/auth/require-advertiser';
import { createAgencyAction } from '@/actions/advertiser';
import { getAdvertiserAgency } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/badge';

export default async function AgencyPage() {
  const advertiser = await requireAdvertiser();
  if (advertiser.account_type !== 'agency') {
    return <p className="text-text-muted">Agency page is only for agency accounts.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const agency = user ? await getAdvertiserAgency(user.id) : null;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold">Agency Profile</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={createAgencyAction} className="space-y-4">
            <div>
              <Label htmlFor="name">Agency Name</Label>
              <Input id="name" name="name" defaultValue={agency?.name ?? ''} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={agency?.description ?? ''} className="mt-1" />
            </div>
            <Button type="submit">{agency ? 'Update Agency' : 'Create Agency'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
