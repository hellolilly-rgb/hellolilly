import Link from 'next/link';
import { signUpAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/badge';

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold gold-gradient-text">Create Account</h1>
          <p className="text-sm text-text-muted">Post ads as an independent or agency</p>
        </CardHeader>
        <CardContent>
          <form action={signUpAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} className="mt-1" />
            </div>
            <div>
              <Label>Account Type</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="flex cursor-pointer flex-col items-center rounded-lg border border-border-subtle p-4 has-[:checked]:border-accent-gold">
                  <input type="radio" name="accountType" value="independent" defaultChecked className="sr-only" />
                  <span className="font-medium">Independent</span>
                  <span className="text-xs text-text-muted">Single listing</span>
                </label>
                <label className="flex cursor-pointer flex-col items-center rounded-lg border border-border-subtle p-4 has-[:checked]:border-accent-gold">
                  <input type="radio" name="accountType" value="agency" className="sr-only" />
                  <span className="font-medium">Agency</span>
                  <span className="text-xs text-text-muted">Multiple listings</span>
                </label>
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm text-text-muted">
              <input type="checkbox" name="acceptTerms" required className="mt-1" />
              <span>
                I am 18+ and accept the{' '}
                <Link href="/legal/terms" className="text-accent-gold hover:underline">Terms of Service</Link>
              </span>
            </label>
            <Button type="submit" className="w-full">Sign Up</Button>
          </form>
          <p className="mt-4 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent-gold hover:underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
