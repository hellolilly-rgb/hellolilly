'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { advertiserProfileSchema, agencySchema } from '@/lib/validations/schemas';
import { slugify } from '@/lib/utils';

export async function createAdvertiserProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const accountType = (user.user_metadata?.account_type ??
    formData.get('account_type')) as 'independent' | 'agency';

  const parsed = advertiserProfileSchema.safeParse({
    display_name: formData.get('display_name'),
    phone: formData.get('phone') || undefined,
    whatsapp: formData.get('whatsapp'),
    city_id: formData.get('city_id'),
    bio: formData.get('bio') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const { data: existing } = await supabase
    .from('advertiser_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('advertiser_profiles')
      .update(parsed.data)
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');
    redirect('/dashboard/profile');
  }

  const { error } = await supabase.from('advertiser_profiles').insert({
    user_id: user.id,
    account_type: accountType ?? 'independent',
    ...parsed.data,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  redirect(accountType === 'agency' ? '/dashboard/agency' : '/dashboard/listings/new');
}

export async function createAgencyAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = agencySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const { data: advertiser } = await supabase
    .from('advertiser_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!advertiser) throw new Error('Complete your profile first');

  const slug = slugify(parsed.data.name);
  const { error } = await supabase.from('agencies').upsert(
    {
      owner_user_id: user.id,
      advertiser_id: advertiser.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
    },
    { onConflict: 'owner_user_id' }
  );

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  redirect('/dashboard/listings/new');
}
