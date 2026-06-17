'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';
import { moneyFromCents } from '@/lib/access';
import { studentName } from '@/lib/relations';

export default function FinanceiroPage(){ return <TrainerShell><FinanceiroContent /></TrainerShell>; }
function FinanceiroContent(){ const {trainer,supabase}=useTrainerSession(); const [charges,setCharges]=useState<any[]>([]); useEffect(()=>{ if(!trainer)return; supabase.from('student_charges').select('*,students(full_name)').eq('trainer_id',trainer.id).order('created_at',{ascending:false}).then(({data})=>setCharges(data||[]));},[trainer]); const paid=charges.filter(c=>c.status==='paid').reduce((s,c)=>s+c.amount_cents,0); const pending=charges.filter(c=>['pending','overdue'].includes(c.status)).reduce((s,c)=>s+c.amount_cents,0); const overdue=charges.filter(c=>c.status==='overdue').reduce((s,c)=>s+c.amount_cents,0);
return <><div className="page-head"><div><span className="eyebrow">Financeiro</span><h1>Financeiro</h1><p>Receita recebida, prevista, pendente, atrasada e conciliação com gateway.</p></div><button className="btn btn-secondary" onClick={()=>{const csv=['Aluno,Descrição,Valor,Status,Vencimento',...charges.map(c=>`${studentName(c).replace('—','')},${c.description},${(c.amount_cents/100).toFixed(2)},${c.status},${c.due_date||''}`)].join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='financeiro-personalos.csv'; a.click();}}>Exportar CSV</button></div><div className="kpi-grid"><div className="card kpi"><span>Recebido</span><strong>{moneyFromCents(paid)}</strong></div><div className="card kpi"><span>Pendente</span><strong>{moneyFromCents(pending)}</strong></div><div className="card kpi"><span>Atrasado</span><strong>{moneyFromCents(overdue)}</strong></div><div className="card kpi"><span>Cobranças</span><strong>{charges.length}</strong></div></div><div className="card table-card" style={{marginTop:18}}><table><thead><tr><th>Aluno</th><th>Descrição</th><th>Valor</th><th>Status</th><th>Vencimento</th></tr></thead><tbody>{charges.map(c=><tr key={c.id}><td>{studentName(c)}</td><td>{c.description}</td><td>{moneyFromCents(c.amount_cents)}</td><td>{c.status}</td><td>{c.due_date||'—'}</td></tr>)}</tbody></table></div></>; }
