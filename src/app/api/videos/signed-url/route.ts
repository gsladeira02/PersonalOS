import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('id');
    if (!videoId) return NextResponse.json({ error: 'Vídeo não informado.' }, { status: 400 });

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });

    const supabase = createAdminSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });

    const { data: video, error } = await supabase
      .from('exercise_videos')
      .select('id,trainer_id,student_id,video_storage_path,status')
      .eq('id', videoId)
      .single();

    if (error || !video || video.status !== 'ready') {
      return NextResponse.json({ error: 'Vídeo não encontrado.' }, { status: 404 });
    }

    const { data: trainer } = await supabase.from('trainers').select('id').eq('user_id', user.id).single();
    const { data: student } = await supabase.from('students').select('id,trainer_id').eq('user_id', user.id).single();

    const isTrainerOwner = trainer?.id === video.trainer_id;
    const isStudentOwner =
  !!student &&
  student.trainer_id === video.trainer_id &&
  (!video.student_id || video.student_id === student.id);

    if (!isTrainerOwner && !isStudentOwner) {
      return NextResponse.json({ error: 'Sem permissão para este vídeo.' }, { status: 403 });
    }

    const bucket = process.env.VIDEO_BUCKET || 'trainer-videos';
    const ttl = Number(process.env.SIGNED_VIDEO_URL_TTL_SECONDS || 3600);
    const { data: signed, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(video.video_storage_path, ttl);
    if (signedError || !signed) return NextResponse.json({ error: signedError?.message || 'Erro ao assinar vídeo.' }, { status: 400 });

    await supabase.from('video_view_logs').insert({
      video_id: video.id,
      trainer_id: video.trainer_id,
      student_id: student?.id || null,
      user_id: user.id
    });

    return NextResponse.json({ url: signed.signedUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro inesperado.' }, { status: 500 });
  }
}
