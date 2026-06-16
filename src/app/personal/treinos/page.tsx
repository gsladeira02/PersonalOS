'use client';

import { FormEvent, useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';

type Student = { id: string; full_name: string };
type Exercise = { id: string; name: string; exercise_videos?: { id: string; title: string }[] };
type Workout = { id: string; title: string; status: string; start_date: string | null; end_date: string | null; students?: { full_name: string } | null };

type Row = { exercise_id: string; sets: string; reps: string; load: string; rest: string; order_index: number; role: string };

export default function TreinosPage() {
  return <TrainerShell><TreinosContent /></TrainerShell>;
}

function TreinosContent() {
  const { trainer, supabase } = useTrainerSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [rows, setRows] = useState<Row[]>([{ exercise_id: '', sets: '3', reps: '10', load: '', rest: '60s', order_index: 1, role: 'principal' }]);
  const [message, setMessage] = useState('');

  async function load() {
    if (!trainer) return;
    const [s, e, w] = await Promise.all([
      supabase.from('students').select('id,full_name').eq('trainer_id', trainer.id).eq('status', 'active'),
      supabase.from('exercises').select('id,name,exercise_videos(id,title)').eq('trainer_id', trainer.id).order('name'),
      supabase.from('workouts').select('id,title,status,start_date,end_date,students(full_name)').eq('trainer_id', trainer.id).order('created_at', { ascending: false })
    ]);
    setStudents((s.data || []) as Student[]);
    setExercises((e.data || []) as Exercise[]);
    setWorkouts((w.data || []) as Workout[]);
  }

  useEffect(() => { load(); }, [trainer]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trainer) return;
    const form = new FormData(event.currentTarget);
    const studentId = String(form.get('student_id'));

    const { data: workout, error } = await supabase.from('workouts').insert({
      trainer_id: trainer.id,
      student_id: studentId,
      title: form.get('title'),
      objective: form.get('objective'),
      start_date: form.get('start_date') || null,
      end_date: form.get('end_date') || null,
      weekly_frequency: Number(form.get('weekly_frequency') || 3),
      status: 'active'
    }).select('id').single();

    if (error || !workout) {
      setMessage(error?.message || 'Erro ao criar treino.');
      return;
    }

    const { data: day } = await supabase.from('workout_days').insert({ trainer_id: trainer.id, workout_id: workout.id, label: 'Treino A', day_order: 1 }).select('id').single();

    if (day) {
      const payload = rows.filter(r => r.exercise_id).map((row, index) => ({
        trainer_id: trainer.id,
        workout_id: workout.id,
        workout_day_id: day.id,
        exercise_id: row.exercise_id,
        order_index: index + 1,
        sets: Number(row.sets || 0),
        reps: row.reps,
        suggested_load: row.load,
        rest_time: row.rest,
        exercise_role: row.role,
        video_source: 'library'
      }));
      if (payload.length) await supabase.from('workout_exercises').insert(payload);
    }

    setMessage('Treino enviado para o aluno.');
    setRows([{ exercise_id: '', sets: '3', reps: '10', load: '', rest: '60s', order_index: 1, role: 'principal' }]);
    event.currentTarget.reset();
    load();
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows(current => current.map((row, i) => i === index ? { ...row, ...patch } : row));
  }

  return (
    <>
      <div className="page-head"><div><span className="eyebrow">Criador de treinos</span><h1>Treinos</h1><p>Monte treinos personalizados usando exercícios e vídeos da biblioteca.</p></div></div>
      {message && <div className={message.includes('enviado') ? 'success' : 'error'}>{message}</div>}
      <div className="card panel-card">
        <h3>Novo treino</h3>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="field"><label>Aluno</label><select className="select" name="student_id" required><option value="">Selecione</option>{students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div>
            <div className="field"><label>Título</label><input className="input" name="title" placeholder="Treino A - Hipertrofia" required /></div>
            <div className="field"><label>Objetivo do ciclo</label><input className="input" name="objective" /></div>
            <div className="field"><label>Frequência semanal</label><input className="input" name="weekly_frequency" type="number" defaultValue="3" /></div>
            <div className="field"><label>Data de início</label><input className="input" name="start_date" type="date" /></div>
            <div className="field"><label>Data de fim</label><input className="input" name="end_date" type="date" /></div>
          </div>
          <hr />
          <h3>Exercícios do Treino A</h3>
          {rows.map((row, index) => (
            <div className="form-grid" key={index} style={{ marginBottom: 12 }}>
              <div className="field"><label>Exercício</label><select className="select" value={row.exercise_id} onChange={e => updateRow(index, { exercise_id: e.target.value })}><option value="">Selecione</option>{exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}</select></div>
              <div className="field"><label>Séries</label><input className="input" value={row.sets} onChange={e => updateRow(index, { sets: e.target.value })} /></div>
              <div className="field"><label>Repetições</label><input className="input" value={row.reps} onChange={e => updateRow(index, { reps: e.target.value })} /></div>
              <div className="field"><label>Carga</label><input className="input" value={row.load} onChange={e => updateRow(index, { load: e.target.value })} /></div>
              <div className="field"><label>Descanso</label><input className="input" value={row.rest} onChange={e => updateRow(index, { rest: e.target.value })} /></div>
              <div className="field"><label>Tipo</label><select className="select" value={row.role} onChange={e => updateRow(index, { role: e.target.value })}><option>aquecimento</option><option>principal</option><option>finalização</option></select></div>
            </div>
          ))}
          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={() => setRows([...rows, { exercise_id: '', sets: '3', reps: '10', load: '', rest: '60s', order_index: rows.length + 1, role: 'principal' }])}>Adicionar exercício</button>
            <button className="btn btn-primary">Enviar treino</button>
          </div>
        </form>
      </div>
      <div className="card table-card" style={{ marginTop: 18 }}>
        <table><thead><tr><th>Treino</th><th>Aluno</th><th>Período</th><th>Status</th></tr></thead><tbody>
          {workouts.map(w => <tr key={w.id}><td><strong>{w.title}</strong></td><td>{w.students?.full_name || '—'}</td><td>{w.start_date || '—'} até {w.end_date || '—'}</td><td>{w.status}</td></tr>)}
        </tbody></table>
        {!workouts.length && <div className="empty">Nenhum treino criado.</div>}
      </div>
    </>
  );
}
