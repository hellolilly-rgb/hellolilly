import { createClient } from '@/lib/supabase/server';
import { updateReportStatusAction } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent } from '@/components/ui/badge';

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from('listing_reports')
    .select('*, listings(title, slug)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Reports</h1>
      <div className="space-y-3">
        {reports?.map((report) => {
          async function dismiss() {
            'use server';
            await updateReportStatusAction(report.id, 'dismissed');
          }
          async function actionTaken() {
            'use server';
            await updateReportStatusAction(report.id, 'action_taken');
          }

          return (
            <Card key={report.id}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{report.listings?.title}</p>
                  <Badge variant={report.status === 'pending' ? 'warning' : 'default'}>
                    {report.status}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary">{report.reason}</p>
                {report.reporter_email && (
                  <p className="text-xs text-text-muted">{report.reporter_email}</p>
                )}
                {report.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <form action={dismiss}>
                      <Button size="sm" variant="outline">Dismiss</Button>
                    </form>
                    <form action={actionTaken}>
                      <Button size="sm" variant="destructive">Action Taken</Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
