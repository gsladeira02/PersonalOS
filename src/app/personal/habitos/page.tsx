'use client';

import { FormEvent, useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';

type Student = { id: string; full_name: string };

export default function HabitosPage() { return <TrainerShell><HabitosContent /></TrainerShell>; }
function HabitosContent() {
  const { trainer, supabase } = useTrainerSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  async function load(){ if(!trainer) return; const [s,h]=await Promise.all([supabase.from('students').select('id,full_name').eq('trainer_id',trainer.id),supabase.from('habits').select('*,students(full_name),habit_logs(id,completed_at)').eq('trainer_id',trainer.id).order('created_at',{ascending:false})]); setStudents((s.data||[]) as Student[]); setHabits(h.data||[]); }
  useEffect(()=>{load();},[trainer]);
  async function submit(e: FormEvent<HTMLFormElement>){ e.preventDefault(); if(!trainer) return; const f=new FormData(e.currentTarget); await supabase.from('habits').insert({trainer_id:trainer.id,student_id:f.get('student_id'),name:f.get('name'),target:f.get('target'),frequency:'daily',status:'active'}); e.currentTarget.reset(); load(); }
  return <>
    <div className="page-head"><div><span className="eyebrow">Hábitos</span><h1>Hábitos</h1><p>Defina metas simples como água, sono, caminhada, proteína, passos e mobilidade.</p></div></div>
    <div className="card panel-card"><h3>Novo hábito</h3><form className="form-grid" onSubmit={submit}><div className="field"><label>Aluno</label><select className="select" name="student_id">{students.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div><div className="field"><label>Hábito</label><select className="select" name="name"><option>beber água</option><option>dormir melhor</option><option>caminhar</option><option>bater proteína</option><option>evitar álcool</option><option>fazer mobilidade</option><option>registrar alimentação</option><option>cumprir passos diários</option><option>minutos ativos</option></select></div><div className="field"><label>Meta</label><input className="input" name="target" placeholder="2L/dia, 8h, 8000 passos..." /></div><button className="btn btn-primary">Criar meta</button></form></div>
    <div className="card table-card" style={{marginTop:18}}><table><thead><tr><th>Aluno</th><th>Hábito</th><th>Meta</th><th>Adesão</th></tr></thead><tbody>{habits.map(h=><tr key={h.id}><td>{h.students?.full_name}</td><td>{h.name}</td><td>{h.target}</td><td>{h.habit_logs?.length || 0} registros</td></tr>)}</tbody></table></div>
  </>;
}
