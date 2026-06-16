import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.invite_token || '');
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.full_name || '').trim();

    if (!token || !email || !password || !fullName) {
      return NextResponse.json({ error: 'Preencha todos os dados.' }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const { data: student, error: studentError } = await supabase.from('students').select('*').eq('invite_token', token).single();
    if (studentError || !student) return NextResponse.json({ error: 'Convite inválido.' }, { status: 404 });

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'student', full_name: fullName }
    });

    if (createError || !created.user) return NextResponse.json({ error: createError?.message || 'Erro ao criar acesso do aluno.' }, { status: 400 });

    await supabase.from('profiles').upsert({ id: created.user.id, email, role: 'student', full_name: fullName });
    await supabase.from('students').update({ user_id: created.user.id, full_name: fullName, email, invite_token: null, status: 'active' }).eq('id', student.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, { status: 500 });
  }
}
