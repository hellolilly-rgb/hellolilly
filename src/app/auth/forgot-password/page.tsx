import { resetPasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/badge';

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold">Reset Password</h1>
        </CardHeader>
        <CardContent>
          <form action={resetPasswordAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full">Send Reset Link</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
