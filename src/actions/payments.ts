'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { generateReferenceCode, formatDate } from '@/lib/utils';
import {
  sendEmail,
  notifyAdmin,
  paymentRequestEmail,
  subscriptionActivatedEmail,
  adminNewPaymentEmail,
} from '@/lib/email';

export async function createPaymentRequestAction(planId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: advertiser } = await supabase
    .from('advertiser_profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single();

  if (!advertiser) return { error: 'Complete your profile first' };

  const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single();
  if (!plan || plan.slug === 'free') return { error: 'Invalid plan' };

  const referenceCode = generateReferenceCode();

  const { data: request, error } = await supabase
    .from('payment_requests')
    .insert({
      advertiser_id: advertiser.id,
      plan_id: planId,
      reference_code: referenceCode,
      status: 'awaiting_payment',
    })
    .select('*')
    .single();

  if (error) return { error: error.message };

  const email = paymentRequestEmail(
    advertiser.display_name,
    referenceCode,
    plan.name,
    plan.price_inr
  );
  await sendEmail({ to: user.email!, ...email });
  await notifyAdmin(
    adminNewPaymentEmail(advertiser.display_name, referenceCode).subject,
    adminNewPaymentEmail(advertiser.display_name, referenceCode).html
  );

  revalidatePath('/dashboard/plans');
  return { success: true, request };
}

export async function markPaymentProofReceivedAction(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('payment_requests')
    .update({ status: 'proof_received' })
    .eq('id', requestId);

  if (error) return { error: error.message };
  revalidatePath('/admin/payments');
  return { success: true };
}

export async function activatePaymentRequestAction(requestId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: request } = await supabase
    .from('payment_requests')
    .select('*, plans(*), advertiser_profiles(*)')
    .eq('id', requestId)
    .single();

  if (!request) return { error: 'Request not found' };

  const plan = request.plans;
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + (plan?.billing_period_days ?? 30));

  await supabase.from('subscriptions').insert({
    advertiser_id: request.advertiser_id,
    plan_id: request.plan_id,
    status: 'active',
    starts_at: new Date().toISOString(),
    ends_at: endsAt.toISOString(),
    activated_by_admin_id: user.id,
    notes: `Activated from payment ${request.reference_code}`,
  });

  await supabase
    .from('payment_requests')
    .update({ status: 'activated' })
    .eq('id', requestId);

  await supabase
    .from('listings')
    .update({
      is_featured: plan?.featured ?? false,
      plan_tier: plan?.slug ?? 'premium',
      expires_at: endsAt.toISOString(),
    })
    .eq('advertiser_id', request.advertiser_id);

  const { data: authUser } = await createServiceClient().auth.admin.getUserById(
    request.advertiser_profiles.user_id
  );

  if (authUser?.user?.email) {
    const email = subscriptionActivatedEmail(
      request.advertiser_profiles.display_name,
      plan?.name ?? 'Premium',
      formatDate(endsAt)
    );
    await sendEmail({ to: authUser.user.email, ...email });
  }

  revalidatePath('/admin/payments');
  revalidatePath('/dashboard/plans');
  return { success: true };
}

export async function activateFreePlanAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: advertiser } = await supabase
    .from('advertiser_profiles')
    .select('id, status')
    .eq('user_id', user.id)
    .single();

  if (!advertiser || advertiser.status !== 'verified') {
    return { error: 'You must be verified first' };
  }

  const { data: freePlan } = await supabase.from('plans').select('*').eq('slug', 'free').single();
  if (!freePlan) return { error: 'Free plan not found' };

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('advertiser_id', advertiser.id)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) return { success: true, message: 'Already active' };

  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + freePlan.billing_period_days);

  const { error } = await supabase.from('subscriptions').insert({
    advertiser_id: advertiser.id,
    plan_id: freePlan.id,
    status: 'active',
    starts_at: new Date().toISOString(),
    ends_at: endsAt.toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/plans');
  return { success: true };
}

export async function expireSubscriptionsCron() {
  const secret = process.env.CRON_SECRET;
  const service = createServiceClient();

  const now = new Date().toISOString();

  const { data: expired } = await service
    .from('subscriptions')
    .select('id, advertiser_id')
    .eq('status', 'active')
    .lt('ends_at', now);

  if (!expired?.length) return { expired: 0 };

  for (const sub of expired) {
    await service
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('id', sub.id);

    await service
      .from('listings')
      .update({ is_active: false, is_featured: false })
      .eq('advertiser_id', sub.advertiser_id);
  }

  return { expired: expired.length, secret: !!secret };
}
