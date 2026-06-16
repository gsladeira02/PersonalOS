'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { trainerCanAccess } from '@/lib/access';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));

    const { data, error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError || !data.user) {
      setLoading(false);
      setError(signError?.message || 'Login inválido.');
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role === 'student') {
      router.replace('/aluno');
      return;
    }

    const { data: trainer } = await supabase.from('trainers').select('subscription_status,grace_until').eq('user_id', data.user.id).single();
    if (trainer && !trainerCanAccess(trainer)) {
      router.replace('/regularizar');
      return;
    }

    router.replace('/personal/dashboard');
  }

  return (
    <div className="form-page">
      <form className="card form-card" onSubmit={onSubmit}>
        <Logo />
        <h1>Entrar</h1>
        <p>Acesse como personal ou aluno. O sistema identifica automaticamente o tipo de usuário.</p>
        {error && <div className="error">{error}</div>}
        <div className="field"><label>E-mail</label><input className="input" type="email" name="email" required /></div>
        <div className="field"><label>Senha</label><input className="input" type="password" name="password" required /></div>
        <div className="actions">
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          <Link className="btn btn-secondary" href="/cadastro">Criar conta</Link>
        </div>
        <p className="small">Esqueci minha senha: use o painel do Supabase Auth ou adicione SMTP em produção para reset por e-mail.</p>
      </form>
    </div>
  );
}
