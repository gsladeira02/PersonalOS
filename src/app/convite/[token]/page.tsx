'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { createBrowserSupabase } from '@/lib/supabase/client';

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const payload = {
      invite_token: params.token,
      full_name: form.get('full_name'),
      email: form.get('email'),
      password: form.get('password')
    };
    const res = await fetch('/api/auth/register-student', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Erro ao aceitar convite.'); setLoading(false); return; }
    const { error: signError } = await supabase.auth.signInWithPassword({ email: String(payload.email), password: String(payload.password) });
    if (signError) { setError('Conta criada. Faça login com e-mail e senha.'); setLoading(false); return; }
    router.replace('/aluno');
  }

  return <div className="form-page"><form className="card form-card" onSubmit={submit}><Logo /><h1>Convite do aluno</h1><p>Crie sua conta para acessar treinos, vídeos, pagamentos e evolução.</p>{error&&<div className="error">{error}</div>}<div className="field"><label>Nome completo</label><input className="input" name="full_name" required /></div><div className="field"><label>E-mail</label><input className="input" type="email" name="email" required /></div><div className="field"><label>Senha</label><input className="input" type="password" name="password" minLength={6} required /></div><button className="btn btn-primary" disabled={loading}>{loading?'Criando acesso...':'Criar acesso do aluno'}</button></form></div>;
}
