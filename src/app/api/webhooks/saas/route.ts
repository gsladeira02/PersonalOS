import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = createAdminSupabase();
  const payload = await request.json().catch(() => ({}));

  await supabase.from('payment_webhook_logs').insert({
    gateway: process.env.PAYMENT_PROVIDER || 'unknown',
    event_type: payload.type || payload.action || 'unknown',
    payload,
    processed: false
  });

  // Produção: valide assinatura do webhook e busque a transação no gateway.
  // Exemplo esperado: external_reference/subscription_id no payload.
  const subscriptionId = payload.external_reference || payload.subscription_id || payload.data?.external_reference;
  const status = payload.status || payload.data?.status;

  if (subscriptionId && ['approved', 'paid', 'authorized', 'active'].includes(String(status))) {
    const { data: sub } = await supabase.from('subscriptions').select('trainer_id').eq('id', subscriptionId).single();
    if (sub) {
      const now = new Date();
      const next = new Date(now);
      next.setMonth(next.getMonth() + 1);
      await supabase.from('subscriptions').update({ status: 'active', current_period_end: next.toISOString() }).eq('id', subscriptionId);
      await supabase.from('trainers').update({ subscription_status: 'active', grace_until: null }).eq('id', sub.trainer_id);
      await supabase.from('saas_payments').update({ status: 'paid', paid_at: now.toISOString() }).eq('subscription_id', subscriptionId);
    }
  }

  return NextResponse.json({ received: true });
}
