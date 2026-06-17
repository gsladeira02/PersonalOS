import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = createAdminSupabase();
  const payload = await request.json().catch(() => ({}));

  await supabase.from('payment_webhook_logs').insert({
    gateway: process.env.STUDENT_PAYMENT_PROVIDER || 'unknown',
    event_type: payload.type || payload.action || 'unknown',
    payload,
    processed: false
  });

  const chargeId = payload.charge_id || payload.external_reference || payload.data?.external_reference;
  const status = payload.status || payload.data?.status;

  if (chargeId && ['approved', 'paid'].includes(String(status))) {
    const now = new Date().toISOString();
    await supabase.from('student_charges').update({ status: 'paid', paid_at: now }).eq('id', chargeId);
    await supabase.from('payment_transactions').insert({
      charge_id: chargeId,
      provider: process.env.STUDENT_PAYMENT_PROVIDER || 'mock',
      external_id: payload.id || payload.data?.id || `webhook_${chargeId}`,
      status: 'paid',
      amount_cents: payload.amount_cents || payload.transaction_amount || 0,
      paid_at: now,
      raw_payload: payload
    });
  }

  return NextResponse.json({ received: true });
}
