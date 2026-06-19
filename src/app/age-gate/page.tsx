import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/badge';

async function verifyAge(formData: FormData) {
  'use server';
  const next = (formData.get('next') as string) || '/';
  const cookieStore = await cookies();
  cookieStore.set('hl_age_verified', 'true', {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  redirect(next.startsWith('/') ? next : '/');
}

export default async function AgeGatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = '/' } = await searchParams;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold/10">
            <ShieldCheck className="h-8 w-8 text-accent-gold" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold">Age Verification</h1>
            <p className="mt-3 text-sm text-text-muted">
              This website contains adult content intended for persons 18 years of age or older.
              By entering, you confirm you are at least 18 and agree to our{' '}
              <a href="/legal/terms" className="text-accent-gold hover:underline">Terms</a>.
            </p>
          </div>
          <form action={verifyAge} className="space-y-3">
            <input type="hidden" name="next" value={next} />
            <Button type="submit" className="w-full" size="lg">
              I am 18 or older — Enter
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <a href="https://google.com">Leave Site</a>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
