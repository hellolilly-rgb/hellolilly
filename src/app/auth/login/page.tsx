import Link from 'next/link';
import { signInAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/badge';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold gold-gradient-text">Welcome Back</h1>
        </CardHeader>
        <CardContent>
          <form action={signInAction} className="space-y-4">
            {next && <input type="hidden" name="next" value={next} />}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <div className="mt-4 flex justify-between text-sm">
            <Link href="/auth/forgot-password" className="text-accent-gold hover:underline">
              Forgot password?
            </Link>
            <Link href="/auth/signup" className="text-text-muted hover:text-accent-gold">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
