import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { createSaasCheckout } from '@/lib/payments/saas';
import { getPlan, type PlanCode } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subscriptionId = String(body.subscription_id || '');
    if (!subscriptionId) return NextResponse.json({ error: 'Assinatura não informada.' }, { status: 400 });

    const supabase = createAdminSupabase();
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('id,trainer_id,plan_code,trainers(email,full_name)')
      .eq('id', subscriptionId)
      .single();

    if (error || !sub) return NextResponse.json({ error: 'Assinatura não encontrada.' }, { status: 404 });

    const plan = getPlan(sub.plan_code);
    const trainer = Array.isArray(sub.trainers) ? sub.trainers[0] : sub.trainers;
    const checkout = await createSaasCheckout({
      trainerId: sub.trainer_id,
      subscriptionId: sub.id,
      planCode: plan.code as PlanCode,
      customerEmail: trainer?.email || '',
      customerName: trainer?.full_name || 'PersonalOS'
    });

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, { status: 500 });
  }
}
