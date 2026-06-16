import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { createSaasCheckout } from '@/lib/payments/saas';
import { getPlan, type PlanCode } from '@/lib/plans';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.full_name || '').trim();
    const plan = getPlan(String(body.plan_code || 'profissional'));

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Preencha nome, e-mail e senha.' }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'trainer', full_name: fullName }
    });

    if (createError || !created.user) {
      return NextResponse.json({ error: createError?.message || 'Erro ao criar usuário.' }, { status: 400 });
    }

    await supabase.from('profiles').upsert({
      id: created.user.id,
      email,
      role: 'trainer',
      full_name: fullName
    });

    const { data: trainer, error: trainerError } = await supabase.from('trainers').insert({
      user_id: created.user.id,
      full_name: fullName,
      cpf: body.cpf || null,
      birth_date: body.birth_date || null,
      phone: body.phone || null,
      email,
      business_name: body.business_name || null,
      cnpj: body.cnpj || null,
      address: body.address || null,
      business_phone: body.business_phone || null,
      plan_code: plan.code,
      subscription_status: 'pending'
    }).select('id').single();

    if (trainerError || !trainer) {
      await supabase.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: trainerError?.message || 'Erro ao criar personal.' }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: subscription, error: subError } = await supabase.from('subscriptions').insert({
      trainer_id: trainer.id,
      plan_code: plan.code,
      amount_cents: plan.priceCents,
      currency: 'BRL',
      billing_interval: 'month',
      status: 'pending',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString()
    }).select('id').single();

    if (subError || !subscription) {
      return NextResponse.json({ error: subError?.message || 'Erro ao criar assinatura.' }, { status: 400 });
    }

    const checkout = await createSaasCheckout({
      trainerId: trainer.id,
      subscriptionId: subscription.id,
      planCode: plan.code as PlanCode,
      customerEmail: email,
      customerName: fullName
    });

    await supabase.from('saas_payments').insert({
      trainer_id: trainer.id,
      subscription_id: subscription.id,
      provider: checkout.provider,
      external_id: checkout.externalId,
      amount_cents: plan.priceCents,
      status: 'created'
    });

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, { status: 500 });
  }
}
