import { redirect } from 'next/navigation';
import { getCurrentAdvertiser } from '@/lib/queries';

export async function requireAdvertiser() {
  const advertiser = await getCurrentAdvertiser();
  if (!advertiser) redirect('/dashboard/onboarding');
  return advertiser;
}
