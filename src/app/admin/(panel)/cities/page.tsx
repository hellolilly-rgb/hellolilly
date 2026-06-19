import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/badge';

export default async function AdminCitiesPage() {
  const supabase = await createClient();
  const { data: cities } = await supabase
    .from('cities')
    .select('*, states(*)')
    .order('name');

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Cities</h1>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {cities?.map((city) => (
          <Card key={city.id}>
            <CardContent className="py-3">
              <p className="font-medium">{city.name}</p>
              <p className="text-xs text-text-muted">{city.states?.name}</p>
              {city.is_featured && (
                <span className="text-xs text-accent-gold">Featured</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
