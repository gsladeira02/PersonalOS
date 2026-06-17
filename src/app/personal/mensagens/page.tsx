'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';
import { studentName } from '@/lib/relations';

type Student = { id:string; full_name:string };
export default function MensagensPage(){ return <TrainerShell><MensagensContent /></TrainerShell>; }
function MensagensContent(){ const {trainer,supabase}=useTrainerSession(); const [students,setStudents]=useState<Student[]>([]); const [msgs,setMsgs]=useState<any[]>([]); async function load(){ if(!trainer)return; const [s,m]=await Promise.all([supabase.from('students').select('id,full_name').eq('trainer_id',trainer.id),supabase.from('messages').select('*,students(full_name)').eq('trainer_id',trainer.id).order('created_at',{ascending:false}).limit(50)]); setStudents((s.data||[]) as Student[]); setMsgs(m.data||[]); } useEffect(()=>{load();},[trainer]); async function send(e:FormEvent<HTMLFormElement>){ e.preventDefault(); if(!trainer)return; const f=new FormData(e.currentTarget); await supabase.from('messages').insert({trainer_id:trainer.id,student_id:f.get('student_id'),sender_role:'trainer',body:f.get('body'),message_type:'text'}); e.currentTarget.reset(); load(); }
return <><div className="page-head"><div><span className="eyebrow">Mensagens</span><h1>Mensagens</h1><p>Conversa individual e feedbacks de treino.</p></div></div><div className="card panel-card"><form className="form-grid" onSubmit={send}><div className="field"><label>Aluno</label><select className="select" name="student_id">{students.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div><div className="field"><label>Mensagem</label><textarea name="body" required /></div><button className="btn btn-primary">Enviar</button></form></div><div className="card table-card" style={{marginTop:18}}><table><thead><tr><th>Aluno</th><th>Mensagem</th><th>Data</th></tr></thead><tbody>{msgs.map(m=><tr key={m.id}><td>{studentName(m)}</td><td>{m.body}</td><td>{new Date(m.created_at).toLocaleString('pt-BR')}</td></tr>)}</tbody></table></div></>; }
