'use client';

import { FormEvent, useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';

type Student = { id: string; full_name: string };

export default function AvaliacoesPage() { return <TrainerShell><AvaliacoesContent /></TrainerShell>; }

function AvaliacoesContent() {
  const { trainer, supabase } = useTrainerSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { if (!trainer) return; Promise.all([
    supabase.from('students').select('id,full_name').eq('trainer_id', trainer.id),
    supabase.from('physical_assessments').select('*,students(full_name)').eq('trainer_id', trainer.id).order('assessment_date', { ascending: false })
  ]).then(([s,a]) => { setStudents((s.data || []) as Student[]); setItems(a.data || []); }); }, [trainer]);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (!trainer) return; const f = new FormData(e.currentTarget); await supabase.from('physical_assessments').insert({ trainer_id: trainer.id, student_id: f.get('student_id'), assessment_date: f.get('assessment_date'), weight_kg: f.get('weight_kg'), height_cm: f.get('height_cm'), waist_cm: f.get('waist_cm'), hip_cm: f.get('hip_cm'), chest_cm: f.get('chest_cm'), arm_cm: f.get('arm_cm'), thigh_cm: f.get('thigh_cm'), calf_cm: f.get('calf_cm'), body_fat_percent: f.get('body_fat_percent') || null, notes: f.get('notes') }); e.currentTarget.reset(); location.reload(); }
  return <>
    <div className="page-head"><div><span className="eyebrow">Avaliação física</span><h1>Avaliações</h1><p>Salve histórico de medidas e evolução. Não apresenta diagnósticos médicos.</p></div></div>
    <div className="notice">Os dados são apenas de acompanhamento físico e não substituem avaliação médica, nutricional ou fisioterapêutica.</div>
    <div className="card panel-card" style={{ marginTop: 18 }}><h3>Nova avaliação</h3><form className="form-grid" onSubmit={submit}>
      <div className="field"><label>Aluno</label><select className="select" name="student_id" required>{students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div>
      <div className="field"><label>Data</label><input className="input" type="date" name="assessment_date" defaultValue={new Date().toISOString().slice(0,10)} /></div>
      {['weight_kg:Peso (kg)','height_cm:Altura (cm)','waist_cm:Cintura','hip_cm:Quadril','chest_cm:Tórax','arm_cm:Braço','thigh_cm:Coxa','calf_cm:Panturrilha','body_fat_percent:% Gordura opcional'].map(x => { const [name,label]=x.split(':'); return <div className="field" key={name}><label>{label}</label><input className="input" name={name} type="number" step="0.01" /></div>; })}
      <div className="field"><label>Observações</label><textarea name="notes" /></div><button className="btn btn-primary">Salvar avaliação</button>
    </form></div>
    <div className="card table-card" style={{ marginTop: 18 }}><table><thead><tr><th>Aluno</th><th>Data</th><th>Peso</th><th>Medidas</th></tr></thead><tbody>{items.map(i => <tr key={i.id}><td>{i.students?.full_name}</td><td>{i.assessment_date}</td><td>{i.weight_kg || '—'} kg</td><td>Cintura {i.waist_cm || '—'} cm</td></tr>)}</tbody></table></div>
  </>;
}
