'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/Logo';

export default function CheckoutSuccessPage() {
  const search = useSearchParams();
  const subscriptionId = search.get('subscription_id');
  const isMock = search.get('mock') === '1';
  const [status, setStatus] = useState('');

  async function approve() {
    const res = await fetch('/api/checkout/confirm-mock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_id: subscriptionId })
    });
    setStatus(res.ok ? 'Pagamento mock aprovado. Faça login para acessar o painel.' : 'Não foi possível aprovar o pagamento mock.');
  }

  return (
    <div className="form-page">
      <div className="card form-card">
        <Logo />
        <h1>Checkout finalizado</h1>
        <p>Em produção, o webhook do gateway confirma o pagamento e libera o painel automaticamente.</p>
        {isMock && <button className="btn btn-primary" onClick={approve}>Aprovar pagamento mock</button>}
        {status && <div className="success">{status}</div>}
        <div className="actions"><Link className="btn btn-secondary" href="/login">Ir para login</Link></div>
      </div>
    </div>
  );
}
