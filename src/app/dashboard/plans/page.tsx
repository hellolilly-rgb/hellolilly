import Link from 'next/link';
import { requireAdvertiser } from '@/lib/auth/require-advertiser';
import {
  getPlans,
  getActiveSubscription,
  getPaymentRequests,
} from '@/lib/queries';
import { createPaymentRequestAction, activateFreePlanAction } from '@/actions/payments';
import { buildWhatsAppPaymentLink } from '@/lib/whatsapp/links';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent, CardHeader } from '@/components/ui/badge';

export default async function PlansPage() {
  const advertiser = await requireAdvertiser();
  const [plans, subscription, paymentRequests] = await Promise.all([
    getPlans(),
    getActiveSubscription(advertiser.id),
    getPaymentRequests(advertiser.id),
  ]);

  async function requestPremium(formData: FormData) {
    'use server';
    const planId = formData.get('planId') as string;
    await createPaymentRequestAction(planId);
  }

  async function activateFree() {
    'use server';
    await activateFreePlanAction();
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold">Plans & Pricing</h1>

      {subscription && (
        <Card className="border-accent-gold/30">
          <CardContent className="py-4">
            <p className="text-sm text-text-muted">Active plan</p>
            <p className="font-medium">{subscription.plans?.name}</p>
            {subscription.ends_at && (
              <p className="text-sm text-text-muted">Expires {formatDate(subscription.ends_at)}</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.featured ? 'border-accent-gold/50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">{plan.name}</h2>
                {plan.featured && <Badge variant="featured">Popular</Badge>}
              </div>
              <p className="text-2xl font-bold gold-gradient-text">
                {plan.price_inr === 0 ? 'Free' : formatINR(plan.price_inr)}
                {plan.price_inr > 0 && <span className="text-sm font-normal text-text-muted">/month</span>}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>Up to {plan.max_photos} photos</li>
                <li>Up to {plan.max_listings} listing{plan.max_listings > 1 ? 's' : ''}</li>
                <li>{plan.featured ? 'Featured placement' : 'Standard placement'}</li>
                <li>{plan.billing_period_days} days duration</li>
              </ul>
              {plan.slug === 'free' ? (
                <form action={activateFree}>
                  <Button variant="outline" className="w-full" disabled={advertiser.status !== 'verified'}>
                    Activate Free Plan
                  </Button>
                </form>
              ) : (
                <form action={requestPremium}>
                  <input type="hidden" name="planId" value={plan.id} />
                  <Button className="w-full" disabled={advertiser.status !== 'verified'}>
                    Request Premium via WhatsApp
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentRequests.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Payment Requests</h2>
          <div className="space-y-3">
            {paymentRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-mono text-sm">{req.reference_code}</p>
                    <p className="text-sm text-text-muted">{req.plans?.name} · {req.status}</p>
                  </div>
                  {req.status === 'awaiting_payment' && req.plans && (
                    <Button variant="whatsapp" size="sm" asChild>
                      <a
                        href={buildWhatsAppPaymentLink(req.reference_code, req.plans.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Send Proof on WhatsApp
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
