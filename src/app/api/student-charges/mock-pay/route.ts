import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { charge_id } = await request.json();
    if (!charge_id) return NextResponse.json({ error: 'Cobrança não informada.' }, { status: 400 });
    const supabase = createAdminSupabase();
    const { data: charge, error } = await supabase.from('student_charges').select('*').eq('id', charge_id).single();
    if (error || !charge) return NextResponse.json({ error: 'Cobrança não encontrada.' }, { status: 404 });
    const now = new Date().toISOString();
    await supabase.from('student_charges').update({ status: 'paid', paid_at: now }).eq('id', charge_id);
    await supabase.from('payment_transactions').insert({
      charge_id,
      trainer_id: charge.trainer_id,
      student_id: charge.student_id,
      provider: 'mock',
      external_id: `mock_${charge_id}`,
      status: 'paid',
      amount_cents: charge.amount_cents,
      paid_at: now,
      raw_payload: { mode: 'mock' }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, { status: 500 });
  }
}
