'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';
import { moneyFromCents } from '@/lib/access';
import { appUrl } from '@/lib/utils';
import { studentName } from '@/lib/relations';

type Student = { id: string; full_name: string; email: string | null };

export default function PagamentosPage() { return <TrainerShell><PagamentosContent /></TrainerShell>; }
function PagamentosContent() {
  const { trainer, supabase } = useTrainerSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [charges, setCharges] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  async function load(){ if(!trainer)return; const [s,c,p]=await Promise.all([supabase.from('students').select('id,full_name,email').eq('trainer_id',trainer.id),supabase.from('student_charges').select('*,students(full_name)').eq('trainer_id',trainer.id).order('created_at',{ascending:false}),supabase.from('student_payment_plans').select('*').eq('trainer_id',trainer.id).order('created_at',{ascending:false})]); setStudents((s.data||[]) as Student[]); setCharges(c.data||[]); setPlans(p.data||[]); }
  useEffect(()=>{load();},[trainer]);
  async function createPlan(e:FormEvent<HTMLFormElement>){ e.preventDefault(); if(!trainer)return; const f=new FormData(e.currentTarget); const amount=Number(String(f.get('amount')||'0').replace(',','.')); await supabase.from('student_payment_plans').insert({trainer_id:trainer.id,name:f.get('name'),description:f.get('description'),amount_cents:Math.round(amount*100),charge_type:f.get('charge_type'),billing_period:f.get('billing_period'),status:'active',services_included:String(f.get('services_included')||'').split(',').map(x=>x.trim()).filter(Boolean)}); e.currentTarget.reset(); load(); }
  async function createCharge(e:FormEvent<HTMLFormElement>){ e.preventDefault(); if(!trainer)return; const f=new FormData(e.currentTarget); const amount=Number(String(f.get('amount')||'0').replace(',','.')); const {data,error}=await supabase.from('student_charges').insert({trainer_id:trainer.id,student_id:f.get('student_id'),description:f.get('description'),amount_cents:Math.round(amount*100),due_date:f.get('due_date'),payment_method:f.get('payment_method'),recurrence:f.get('recurrence'),status:'pending'}).select('id').single(); if(data && !error){ await supabase.from('student_charges').update({payment_link: appUrl(`/pagar/${data.id}`)}).eq('id',data.id); } e.currentTarget.reset(); load(); }
  return <>
    <div className="page-head"><div><span className="eyebrow">Cobrança dos alunos</span><h1>Pagamentos</h1><p>Fluxo separado da assinatura SaaS do PersonalOS.</p></div></div>
    <div className="grid-2">
      <div className="card panel-card"><h3>Plano vendido pelo personal</h3><form className="form-grid" onSubmit={createPlan}><div className="field"><label>Nome</label><input className="input" name="name" placeholder="Consultoria Online Mensal" required /></div><div className="field"><label>Valor</label><input className="input" name="amount" placeholder="149,90" required /></div><div className="field"><label>Tipo</label><select className="select" name="charge_type"><option>recorrente</option><option>única</option></select></div><div className="field"><label>Periodicidade</label><select className="select" name="billing_period"><option>mensal</option><option>semanal</option><option>trimestral</option><option>semestral</option><option>anual</option></select></div><div className="field"><label>Descrição</label><textarea name="description" /></div><div className="field"><label>Serviços incluídos</label><input className="input" name="services_included" placeholder="treino, avaliação, mensagens" /></div><button className="btn btn-primary">Criar plano</button></form></div>
      <div className="card panel-card"><h3>Nova cobrança</h3><form className="form-grid" onSubmit={createCharge}><div className="field"><label>Aluno</label><select className="select" name="student_id">{students.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div><div className="field"><label>Valor</label><input className="input" name="amount" placeholder="149,90" required /></div><div className="field"><label>Descrição</label><input className="input" name="description" required /></div><div className="field"><label>Vencimento</label><input className="input" type="date" name="due_date" /></div><div className="field"><label>Forma</label><select className="select" name="payment_method"><option>pix</option><option>cartão</option><option>boleto</option><option>link</option></select></div><div className="field"><label>Recorrência</label><select className="select" name="recurrence"><option>avulsa</option><option>mensal</option><option>trimestral</option><option>semestral</option><option>anual</option></select></div><button className="btn btn-primary">Gerar cobrança</button></form></div>
    </div>
    <div className="grid-2" style={{marginTop:18}}><div className="card table-card"><table><thead><tr><th>Planos</th><th>Valor</th><th>Status</th></tr></thead><tbody>{plans.map(p=><tr key={p.id}><td>{p.name}</td><td>{moneyFromCents(p.amount_cents)}</td><td>{p.status}</td></tr>)}</tbody></table></div><div className="card table-card"><table><thead><tr><th>Cobrança</th><th>Aluno</th><th>Status</th><th>Link</th></tr></thead><tbody>{charges.map(c=><tr key={c.id}><td>{c.description}<br />{moneyFromCents(c.amount_cents)}</td><td>{studentName(c)}</td><td>{c.status}</td><td><code>{c.payment_link || appUrl(`/pagar/${c.id}`)}</code></td></tr>)}</tbody></table></div></div>
  </>;
}
