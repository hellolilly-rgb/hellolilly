import { createClient } from '@/lib/supabase/server';
import {
  markPaymentProofReceivedAction,
  activatePaymentRequestAction,
} from '@/actions/payments';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent } from '@/components/ui/badge';

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from('payment_requests')
    .select('*, plans(*), advertiser_profiles(*)')
    .in('status', ['awaiting_payment', 'proof_received'])
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Payment Requests</h1>
      <p className="text-sm text-text-muted">
        Check WhatsApp for payment proof, then activate subscriptions.
      </p>

      {!requests?.length ? (
        <p className="text-text-muted">No pending payment requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            async function markProof() {
              'use server';
              await markPaymentProofReceivedAction(req.id);
            }
            async function activate() {
              'use server';
              await activatePaymentRequestAction(req.id);
            }

            return (
              <Card key={req.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-mono font-medium">{req.reference_code}</p>
                    <p className="text-sm text-text-muted">
                      {req.advertiser_profiles?.display_name} · {req.plans?.name} ·{' '}
                      {formatINR(req.plans?.price_inr ?? 0)}
                    </p>
                    <p className="text-xs text-text-muted">{formatDate(req.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={req.status === 'proof_received' ? 'verified' : 'warning'}>
                      {req.status}
                    </Badge>
                    {req.status === 'awaiting_payment' && (
                      <form action={markProof}>
                        <Button size="sm" variant="outline">Proof Received</Button>
                      </form>
                    )}
                    {req.status === 'proof_received' && (
                      <form action={activate}>
                        <Button size="sm">Activate</Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
