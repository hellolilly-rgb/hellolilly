'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signupSchema, loginSchema } from '@/lib/validations/schemas';

export async function signUpAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    accountType: formData.get('accountType'),
    acceptTerms: formData.get('acceptTerms') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { account_type: parsed.data.accountType },
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: 'Sign up failed' };

  redirect('/dashboard/onboarding');
}

export async function signInAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: error.message };

  const next = formData.get('next') as string | null;
  redirect(next && next.startsWith('/') ? next : '/dashboard');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email required' };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
  });

  if (error) return { error: error.message };
  return { success: 'Check your email for a reset link.' };
}
