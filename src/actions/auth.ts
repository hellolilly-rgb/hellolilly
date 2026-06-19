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
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { account_type: parsed.data.accountType },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Sign up failed');

  redirect('/dashboard/onboarding');
}

export async function signInAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) throw new Error(error.message);

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
  if (!email) throw new Error('Email required');

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
  });

  if (error) throw new Error(error.message);
  redirect('/auth/forgot-password?sent=1');
}
