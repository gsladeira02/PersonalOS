'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Logo } from '@/components/Logo';
import { getPlan, PERSONAL_OS_PLANS } from '@/lib/plans';

export default function CadastroPage() {
  const search = useSearchParams();
  const plan = getPlan(search.get('plano'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch('/api/auth/register-trainer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível criar sua conta.');
      return;
    }

    window.location.href = data.checkoutUrl;
  }

  return (
    <div className="form-page">
      <form className="card form-card" onSubmit={onSubmit}>
        <Logo />
        <h1>Cadastro do personal</h1>
        <p>Plano selecionado: <strong>{plan.name}</strong> — {plan.price}. Depois do cadastro você irá para o checkout da assinatura.</p>
        {error && <div className="error">{error}</div>}
        <input type="hidden" name="plan_code" value={plan.code} />
        <div className="form-grid">
          <div className="field"><label>Nome completo</label><input className="input" name="full_name" required /></div>
          <div className="field"><label>CPF</label><input className="input" name="cpf" required /></div>
          <div className="field"><label>Data de nascimento</label><input className="input" name="birth_date" type="date" required /></div>
          <div className="field"><label>Celular</label><input className="input" name="phone" required /></div>
          <div className="field"><label>E-mail</label><input className="input" name="email" type="email" required /></div>
          <div className="field"><label>Senha</label><input className="input" name="password" type="password" minLength={6} required /></div>
          <div className="field"><label>Nome profissional / consultoria</label><input className="input" name="business_name" required /></div>
          <div className="field"><label>CNPJ opcional</label><input className="input" name="cnpj" /></div>
          <div className="field"><label>Endereço opcional</label><input className="input" name="address" /></div>
          <div className="field"><label>Telefone comercial</label><input className="input" name="business_phone" /></div>
          <div className="field"><label>Trocar plano</label><select className="select" name="plan_code" defaultValue={plan.code}>{Object.values(PERSONAL_OS_PLANS).map(p => <option key={p.code} value={p.code}>{p.name} — {p.price}</option>)}</select></div>
        </div>
        <div className="notice">O login só será liberado após confirmação do pagamento. Em modo mock, o botão de sucesso libera a assinatura para testes.</div>
        <div className="actions">
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Criando conta...' : 'Ir para checkout'}</button>
          <Link className="btn btn-secondary" href="/login">Já tenho conta</Link>
        </div>
      </form>
    </div>
  );
}
