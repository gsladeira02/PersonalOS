import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function runSync(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const headerSecret = request.headers.get('x-cron-secret');
  const bearer = auth.replace('Bearer ', '');
  if (process.env.CRON_SECRET && headerSecret !== process.env.CRON_SECRET && bearer !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = createAdminSupabase();
  const { data: connections } = await supabase.from('health_connections').select('id,student_id,trainer_id,provider,status').eq('status', 'connected');

  for (const connection of connections || []) {
    await supabase.from('health_sync_logs').insert({
      connection_id: connection.id,
      student_id: connection.student_id,
      trainer_id: connection.trainer_id,
      provider: connection.provider,
      status: 'skipped',
      message: 'Provider sem credenciais reais configuradas. Estrutura pronta para sincronização diária.'
    });
  }

  return NextResponse.json({ synced: connections?.length || 0 });
}

export async function GET(request: Request) {
  return runSync(request);
}

export async function POST(request: Request) {
  return runSync(request);
}
