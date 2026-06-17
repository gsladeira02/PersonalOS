import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, context: { params: { chargeId: string } }) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('student_charges')
    .select('id,trainer_id,student_id,description,amount_cents,due_date,payment_method,status,payment_link,students(full_name,email)')
    .eq('id', context.params.chargeId)
    .single();
  if (error || !data) return NextResponse.json({ error: 'Cobrança não encontrada.' }, { status: 404 });
  return NextResponse.json(data);
}
