import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    resend = new Resend(key);
  }
  return resend;
}

const from = () => process.env.EMAIL_FROM ?? 'noreply@hellolilly.in';
const adminEmail = () => process.env.ADMIN_EMAIL ?? '';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const client = getResend();
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set, skipping:', subject);
    return { ok: false as const };
  }
  try {
    await client.emails.send({ from: from(), to, subject, html });
    return { ok: true as const };
  } catch (err) {
    console.error('[email] send failed:', err);
    return { ok: false as const };
  }
}

export async function notifyAdmin(subject: string, html: string) {
  const email = adminEmail();
  if (!email) return;
  await sendEmail({ to: email, subject, html });
}

export function verificationSubmittedEmail(name: string) {
  return {
    subject: 'Verification submitted — HelloLilly',
    html: `<p>Hi ${name},</p><p>Your verification video has been submitted and is pending review. We'll email you once it's approved.</p>`,
  };
}

export function verificationApprovedEmail(name: string) {
  return {
    subject: 'Verification approved — HelloLilly',
    html: `<p>Hi ${name},</p><p>Your profile has been verified! You can now publish your listings.</p>`,
  };
}

export function verificationRejectedEmail(name: string, reason: string) {
  return {
    subject: 'Verification rejected — HelloLilly',
    html: `<p>Hi ${name},</p><p>Your verification was rejected.</p><p><strong>Reason:</strong> ${reason}</p><p>Please upload a new video from your dashboard.</p>`,
  };
}

export function paymentRequestEmail(name: string, referenceCode: string, planName: string, price: number) {
  const whatsapp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? '';
  return {
    subject: `Payment request ${referenceCode} — HelloLilly`,
    html: `<p>Hi ${name},</p><p>Your payment request for <strong>${planName}</strong> (₹${price}) has been created.</p><p><strong>Reference:</strong> ${referenceCode}</p><p>Contact us on WhatsApp: +${whatsapp} with your payment proof.</p>`,
  };
}

export function subscriptionActivatedEmail(name: string, planName: string, expiresAt: string) {
  return {
    subject: 'Subscription activated — HelloLilly',
    html: `<p>Hi ${name},</p><p>Your <strong>${planName}</strong> subscription is now active until ${expiresAt}.</p>`,
  };
}

export function subscriptionExpiringEmail(name: string, expiresAt: string) {
  return {
    subject: 'Subscription expiring soon — HelloLilly',
    html: `<p>Hi ${name},</p><p>Your subscription expires on ${expiresAt}. Renew from your dashboard to keep your listings featured.</p>`,
  };
}

export function adminNewVerificationEmail(advertiserName: string) {
  return {
    subject: 'New verification pending — HelloLilly Admin',
    html: `<p>New verification submission from <strong>${advertiserName}</strong>. Review it in the admin dashboard.</p>`,
  };
}

export function adminNewPaymentEmail(advertiserName: string, referenceCode: string) {
  return {
    subject: `New payment request ${referenceCode} — HelloLilly Admin`,
    html: `<p>Payment request <strong>${referenceCode}</strong> from <strong>${advertiserName}</strong>. Check WhatsApp for proof.</p>`,
  };
}
