'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';
import { appUrl } from '@/lib/utils';

type Student = { id: string; full_name: string; email: string | null; phone: string | null; goal: string | null; level: string | null; status: string; monthly_price_cents: number | null; due_day: number | null; invite_token: string | null };

export default function AlunosPage() {
  return <TrainerShell><AlunosContent /></TrainerShell>;
}

function AlunosContent() {
  const { trainer, supabase } = useTrainerSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    if (!trainer) return;
    const { data } = await supabase.from('students').select('*').eq('trainer_id', trainer.id).order('created_at', { ascending: false });
    setStudents((data || []) as Student[]);
  }

  useEffect(() => { load(); }, [trainer]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trainer) return;
    setMessage('');
    const form = new FormData(event.currentTarget);
    const amount = Number(String(form.get('monthly_price') || '0').replace(',', '.'));
    const payload = {
      trainer_id: trainer.id,
      full_name: form.get('full_name'),
      email: form.get('email'),
      phone: form.get('phone'),
      birth_date: form.get('birth_date') || null,
      sex: form.get('sex'),
      goal: form.get('goal'),
      level: form.get('level'),
      restrictions: form.get('restrictions'),
      injuries: form.get('injuries'),
      plan_name: form.get('plan_name'),
      monthly_price_cents: Math.round(amount * 100),
      due_day: Number(form.get('due_day') || 10),
      preferred_payment_method: form.get('preferred_payment_method'),
      status: 'active',
      invite_token: crypto.randomUUID()
    };
    const { error } = await supabase.from('students').insert(payload);
    if (error) setMessage(error.message); else {
      setMessage('Aluno cadastrado. Copie o convite na lista abaixo.');
      event.currentTarget.reset();
      load();
    }
  }

  return (
    <>
      <div className="page-head"><div><span className="eyebrow">Gestão de alunos</span><h1>Alunos</h1><p>Cadastre alunos, objetivos, restrições, plano e convite para acesso.</p></div></div>
      {message && <div className={message.includes('cadastrado') ? 'success' : 'error'}>{message}</div>}
      <div className="card panel-card">
        <h3>Novo aluno</h3>
        <form className="form-grid" onSubmit={onSubmit}>
          <div className="field"><label>Nome completo</label><input className="input" name="full_name" required /></div>
          <div className="field"><label>E-mail</label><input className="input" name="email" type="email" required /></div>
          <div className="field"><label>Celular</label><input className="input" name="phone" /></div>
          <div className="field"><label>Data de nascimento</label><input className="input" name="birth_date" type="date" /></div>
          <div className="field"><label>Sexo</label><select className="select" name="sex"><option>não informado</option><option>feminino</option><option>masculino</option><option>outro</option></select></div>
          <div className="field"><label>Nível</label><select className="select" name="level"><option>iniciante</option><option>intermediário</option><option>avançado</option></select></div>
          <div className="field"><label>Objetivo principal</label><input className="input" name="goal" /></div>
          <div className="field"><label>Plano contratado</label><input className="input" name="plan_name" placeholder="Consultoria Online Mensal" /></div>
          <div className="field"><label>Valor mensal cobrado</label><input className="input" name="monthly_price" placeholder="149,90" /></div>
          <div className="field"><label>Dia de vencimento</label><input className="input" name="due_day" type="number" min="1" max="31" defaultValue="10" /></div>
          <div className="field"><label>Forma de pagamento preferida</label><select className="select" name="preferred_payment_method"><option>pix</option><option>cartão</option><option>boleto</option><option>manual</option></select></div>
          <div className="field"><label>Restrições/observações</label><textarea name="restrictions" /></div>
          <div className="field"><label>Lesões informadas</label><textarea name="injuries" /></div>
          <button className="btn btn-primary">Cadastrar aluno</button>
        </form>
      </div>
      <div className="card table-card" style={{ marginTop: 18 }}>
        <table><thead><tr><th>Aluno</th><th>Objetivo</th><th>Status</th><th>Convite</th></tr></thead><tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td><strong>{student.full_name}</strong><br /><span className="small">{student.email}</span></td>
              <td>{student.goal || '—'}</td>
              <td>{student.status}</td>
              <td>{student.invite_token ? <code>{appUrl(`/convite/${student.invite_token}`)}</code> : 'Aluno já vinculado'}</td>
            </tr>
          ))}
        </tbody></table>
        {!students.length && <div className="empty">Nenhum aluno cadastrado ainda.</div>}
      </div>
    </>
  );
}
