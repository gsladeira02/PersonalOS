'use client';

import { FormEvent, useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';

type Student = { id: string; full_name: string };
type Appointment = { id: string; title: string; start_time: string; end_time: string; status: string; mode: string; students?: { full_name: string } | null };

export default function AgendaPage() { return <TrainerShell><AgendaContent /></TrainerShell>; }

function AgendaContent() {
  const { trainer, supabase } = useTrainerSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [items, setItems] = useState<Appointment[]>([]);

  async function load() {
    if (!trainer) return;
    const [s, a] = await Promise.all([
      supabase.from('students').select('id,full_name').eq('trainer_id', trainer.id),
      supabase.from('appointments').select('id,title,start_time,end_time,status,mode,students(full_name)').eq('trainer_id', trainer.id).order('start_time')
    ]);
    setStudents((s.data || []) as Student[]);
    setItems((a.data || []) as Appointment[]);
  }
  useEffect(() => { load(); }, [trainer]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!trainer) return;
    const form = new FormData(event.currentTarget);
    await supabase.from('appointments').insert({
      trainer_id: trainer.id,
      student_id: form.get('student_id') || null,
      title: form.get('title'),
      start_time: form.get('start_time'),
      end_time: form.get('end_time'),
      mode: form.get('mode'),
      status: 'confirmed',
      approval_mode: form.get('approval_mode')
    });
    event.currentTarget.reset(); load();
  }

  async function blockException(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!trainer) return;
    const form = new FormData(event.currentTarget);
    await supabase.from('appointment_exceptions').insert({
      trainer_id: trainer.id,
      date: form.get('date'),
      reason: form.get('reason') || 'Bloqueio de agenda',
      is_available: false
    });
    event.currentTarget.reset();
  }

  return <>
    <div className="page-head"><div><span className="eyebrow">Agenda</span><h1>Agenda</h1><p>Cadastre horários, atendimentos, bloqueios e exceções como feriados, viagens e folgas.</p></div></div>
    <div className="grid-2">
      <div className="card panel-card"><h3>Novo agendamento</h3><form className="form-grid" onSubmit={create}>
        <div className="field"><label>Aluno</label><select className="select" name="student_id"><option value="">Sem aluno</option>{students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div>
        <div className="field"><label>Título</label><input className="input" name="title" required /></div>
        <div className="field"><label>Início</label><input className="input" type="datetime-local" name="start_time" required /></div>
        <div className="field"><label>Fim</label><input className="input" type="datetime-local" name="end_time" required /></div>
        <div className="field"><label>Modo</label><select className="select" name="mode"><option>presencial</option><option>online</option></select></div>
        <div className="field"><label>Aprovação</label><select className="select" name="approval_mode"><option>manual</option><option>automática</option></select></div>
        <button className="btn btn-primary">Salvar</button>
      </form></div>
      <div className="card panel-card"><h3>Bloquear data específica</h3><form className="form-grid" onSubmit={blockException}>
        <div className="field"><label>Data</label><input className="input" type="date" name="date" required /></div>
        <div className="field"><label>Motivo</label><input className="input" name="reason" placeholder="Feriado, viagem, folga..." /></div>
        <button className="btn btn-secondary">Criar exceção</button>
      </form></div>
    </div>
    <div className="card table-card" style={{ marginTop: 18 }}><table><thead><tr><th>Horário</th><th>Aluno</th><th>Título</th><th>Status</th></tr></thead><tbody>{items.map(i => <tr key={i.id}><td>{new Date(i.start_time).toLocaleString('pt-BR')}<br /><span className="small">até {new Date(i.end_time).toLocaleTimeString('pt-BR')}</span></td><td>{i.students?.full_name || '—'}</td><td>{i.title}<br /><span className="small">{i.mode}</span></td><td>{i.status}</td></tr>)}</tbody></table></div>
  </>;
}
