import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (process.env.DEV_AUTO_APPROVE_CHECKOUT !== 'true') {
      return NextResponse.json({ error: 'Aprovação mock desativada.' }, { status: 403 });
    }

    const body = await request.json();
    const subscriptionId = String(body.subscription_id || '');
    const supabase = createAdminSupabase();

    const { data: sub, error } = await supabase.from('subscriptions').select('id,trainer_id').eq('id', subscriptionId).single();
    if (error || !sub) return NextResponse.json({ error: 'Assinatura não encontrada.' }, { status: 404 });

    const now = new Date();
    const next = new Date(now);
    next.setMonth(next.getMonth() + 1);

    await supabase.from('subscriptions').update({
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: next.toISOString(),
      updated_at: now.toISOString()
    }).eq('id', subscriptionId);

    await supabase.from('trainers').update({
      subscription_status: 'active',
      grace_until: null,
      updated_at: now.toISOString()
    }).eq('id', sub.trainer_id);

    await supabase.from('saas_payments').update({
      status: 'paid',
      paid_at: now.toISOString()
    }).eq('subscription_id', subscriptionId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, { status: 500 });
  }
}
