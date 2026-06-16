'use client';

import { FormEvent, useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';
import { sanitizeFileName } from '@/lib/utils';

type Exercise = { id: string; name: string; muscle_group: string; equipment: string | null; difficulty: string | null; instructions: string | null; exercise_videos?: { id: string; title: string; status: string }[] };

const categories = ['peito', 'costas', 'ombros', 'bíceps', 'tríceps', 'pernas', 'glúteos', 'abdômen', 'cardio', 'mobilidade', 'alongamento', 'funcional'];

export default function ExerciciosPage() {
  return <TrainerShell><ExerciciosContent /></TrainerShell>;
}

function ExerciciosContent() {
  const { trainer, supabase } = useTrainerSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  async function load() {
    if (!trainer) return;
    const { data } = await supabase
      .from('exercises')
      .select('id,name,muscle_group,equipment,difficulty,instructions,exercise_videos(id,title,status)')
      .eq('trainer_id', trainer.id)
      .order('created_at', { ascending: false });
    setExercises((data || []) as Exercise[]);
  }

  useEffect(() => { load(); }, [trainer]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trainer) return;
    setMessage('');
    setUploading(true);
    const form = new FormData(event.currentTarget);
    const file = form.get('video') as File | null;
    const maxMb = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB || process.env.MAX_VIDEO_UPLOAD_MB || 250);

    if (file && file.size > 0) {
      const allowed = ['video/mp4', 'video/quicktime', 'video/webm'];
      if (!allowed.includes(file.type)) {
        setMessage('Formato inválido. Envie MP4, MOV ou WEBM.');
        setUploading(false);
        return;
      }
      if (file.size > maxMb * 1024 * 1024) {
        setMessage(`Vídeo muito grande. Limite atual: ${maxMb} MB.`);
        setUploading(false);
        return;
      }
    }

    const { data: exercise, error } = await supabase.from('exercises').insert({
      trainer_id: trainer.id,
      name: form.get('name'),
      muscle_group: form.get('muscle_group'),
      equipment: form.get('equipment'),
      difficulty: form.get('difficulty'),
      instructions: form.get('instructions'),
      common_mistakes: form.get('common_mistakes'),
      notes: form.get('notes'),
      tags: String(form.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
      external_video_url: form.get('external_video_url') || null
    }).select('id,name').single();

    if (error || !exercise) {
      setMessage(error?.message || 'Erro ao salvar exercício.');
      setUploading(false);
      return;
    }

    if (file && file.size > 0) {
      const path = `${trainer.id}/exercises/${exercise.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from('trainer-videos').upload(path, file, { contentType: file.type, upsert: true });
      if (uploadError) {
        setMessage(`Exercício salvo, mas o upload falhou: ${uploadError.message}`);
        setUploading(false);
        load();
        return;
      }
      await supabase.from('exercise_videos').insert({
        trainer_id: trainer.id,
        exercise_id: exercise.id,
        title: `Vídeo padrão - ${exercise.name}`,
        video_storage_path: path,
        video_size: file.size,
        video_mime_type: file.type,
        uploaded_by: trainer.user_id,
        visibility: 'private',
        status: 'ready',
        external_video_url: form.get('external_video_url') || null
      });
      await supabase.from('video_upload_logs').insert({ trainer_id: trainer.id, exercise_id: exercise.id, storage_path: path, file_size: file.size, mime_type: file.type, status: 'uploaded' });
    }

    setMessage('Exercício cadastrado com vídeo próprio seguro.');
    setUploading(false);
    setPreview(null);
    event.currentTarget.reset();
    load();
  }

  async function playVideo(videoId: string) {
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) return;
    const res = await fetch(`/api/videos/signed-url?id=${videoId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setVideoUrl(data.url || null);
    if (data.error) setMessage(data.error);
  }

  return (
    <>
      <div className="page-head"><div><span className="eyebrow">Biblioteca com vídeos próprios</span><h1>Exercícios</h1><p>O upload próprio é a opção principal. Link externo é apenas secundário.</p></div></div>
      {message && <div className={message.includes('cadastrado') || message.includes('seguro') ? 'success' : 'error'}>{message}</div>}
      {videoUrl && <div className="card panel-card"><h3>Prévia segura</h3><div className="video-box"><video src={videoUrl} controls playsInline /></div></div>}
      <div className="card panel-card">
        <h3>Criar exercício</h3>
        <form className="form-grid" onSubmit={onSubmit}>
          <div className="field"><label>Nome do exercício</label><input className="input" name="name" required /></div>
          <div className="field"><label>Grupo muscular</label><select className="select" name="muscle_group">{categories.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label>Equipamento</label><input className="input" name="equipment" /></div>
          <div className="field"><label>Dificuldade</label><select className="select" name="difficulty"><option>iniciante</option><option>intermediário</option><option>avançado</option></select></div>
          <div className="field"><label>Enviar vídeo próprio</label><input className="input" type="file" name="video" accept="video/mp4,video/quicktime,video/webm" onChange={e => setPreview(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} /></div>
          <div className="field"><label>Usar link externo opcional</label><input className="input" name="external_video_url" placeholder="https://..." /></div>
          <div className="field"><label>Instruções de execução</label><textarea name="instructions" /></div>
          <div className="field"><label>Erros comuns</label><textarea name="common_mistakes" /></div>
          <div className="field"><label>Observações</label><textarea name="notes" /></div>
          <div className="field"><label>Tags separadas por vírgula</label><input className="input" name="tags" /></div>
          {preview && <div className="field"><label>Pré-visualização antes de salvar</label><div className="video-box"><video src={preview} controls playsInline /></div></div>}
          <button className="btn btn-primary" disabled={uploading}>{uploading ? 'Enviando vídeo...' : 'Salvar exercício'}</button>
        </form>
      </div>
      <div className="card table-card" style={{ marginTop: 18 }}>
        <table><thead><tr><th>Exercício</th><th>Categoria</th><th>Vídeo</th><th>Ações</th></tr></thead><tbody>
          {exercises.map(ex => (
            <tr key={ex.id}>
              <td><strong>{ex.name}</strong><br /><span className="small">{ex.instructions || 'Sem instruções'}</span></td>
              <td>{ex.muscle_group}<br /><span className="small">{ex.equipment || 'sem equipamento'}</span></td>
              <td>{ex.exercise_videos?.length ? <span className="badge">Vídeo próprio</span> : 'Sem vídeo'}</td>
              <td>{ex.exercise_videos?.[0] && <button className="btn btn-secondary" onClick={() => playVideo(ex.exercise_videos![0].id)}>Assistir</button>}</td>
            </tr>
          ))}
        </tbody></table>
        {!exercises.length && <div className="empty">Nenhum exercício cadastrado.</div>}
      </div>
    </>
  );
}
