import { createClient } from '@/lib/supabase/server';
import { updatePlanAction } from '@/actions/admin';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/badge';

export default async function AdminPlansPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from('plans').select('*').order('priority_rank');

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Plans</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {plans?.map((plan) => {
          async function update(formData: FormData) {
            'use server';
            await updatePlanAction(plan.id, formData);
          }

          return (
            <Card key={plan.id}>
              <CardHeader>
                <h2 className="font-display text-xl">{plan.name}</h2>
                <p className="text-text-muted">{formatINR(plan.price_inr)}/month</p>
              </CardHeader>
              <CardContent>
                <form action={update} className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input name="name" defaultValue={plan.name} className="mt-1" />
                  </div>
                  <div>
                    <Label>Price (INR)</Label>
                    <Input name="price_inr" type="number" defaultValue={plan.price_inr} className="mt-1" />
                  </div>
                  <div>
                    <Label>Max Photos</Label>
                    <Input name="max_photos" type="number" defaultValue={plan.max_photos} className="mt-1" />
                  </div>
                  <div>
                    <Label>Max Listings</Label>
                    <Input name="max_listings" type="number" defaultValue={plan.max_listings} className="mt-1" />
                  </div>
                  <Button type="submit" size="sm">Save</Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
