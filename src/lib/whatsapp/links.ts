export function buildWhatsAppPaymentLink(referenceCode: string, planName: string): string {
  const phone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? '';
  const message = encodeURIComponent(
    `Hello, I want the ${planName} plan for HelloLilly. Reference: ${referenceCode}`
  );
  return `https://wa.me/${phone}?text=${message}`;
}

export function buildListingContactLink(whatsapp: string, listingTitle: string): string {
  const clean = whatsapp.replace(/\D/g, '');
  const message = encodeURIComponent(`Hi, I'm interested in your listing: ${listingTitle}`);
  return `https://wa.me/${clean}?text=${message}`;
}
