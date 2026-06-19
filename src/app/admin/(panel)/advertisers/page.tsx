import { createClient } from '@/lib/supabase/server';
import { suspendAdvertiserAction } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent } from '@/components/ui/badge';

export default async function AdminAdvertisersPage() {
  const supabase = await createClient();
  const { data: advertisers } = await supabase
    .from('advertiser_profiles')
    .select('*, cities(*)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Advertisers</h1>
      <div className="space-y-3">
        {advertisers?.map((adv) => {
          async function suspend() {
            'use server';
            await suspendAdvertiserAction(adv.id);
          }

          const statusVariant =
            adv.status === 'verified' ? 'verified' :
            adv.status === 'suspended' ? 'error' : 'warning';

          return (
            <Card key={adv.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{adv.display_name}</p>
                  <p className="text-sm text-text-muted capitalize">
                    {adv.account_type} · {adv.cities?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant}>{adv.status}</Badge>
                  {adv.status !== 'suspended' && (
                    <form action={suspend}>
                      <Button size="sm" variant="destructive">Suspend</Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
