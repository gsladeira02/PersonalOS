'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { moneyFromCents } from '@/lib/access';

export default function PagarPage() {
  const params = useParams<{ chargeId: string }>();
  const [charge, setCharge] = useState<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`/api/student-charges/${params.chargeId}`).then(res => res.json()).then(data => setCharge(data));
  }, [params.chargeId]);

  async function payMock() {
    const res = await fetch('/api/student-charges/mock-pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ charge_id: params.chargeId }) });
    setStatus(res.ok ? 'Pagamento mock aprovado. O personal já verá esta cobrança como paga.' : 'Não foi possível aprovar o pagamento mock.');
  }

  return <div className="form-page"><div className="card form-card"><Logo /><h1>Pagamento</h1>{!charge ? <p>Carregando cobrança...</p> : <><p>Aluno: <strong>{charge.students?.full_name}</strong></p><p>{charge.description}</p><h2>{moneyFromCents(charge.amount_cents)}</h2><p>Status: {charge.status}</p>{charge.status !== 'paid' && <div className="actions"><button className="btn btn-primary" onClick={payMock}>Pagar com PIX mock</button><button className="btn btn-secondary" onClick={payMock}>Pagar com cartão mock</button></div>}{status && <div className="success">{status}</div>}<p className="small">Produção: conecte Mercado Pago, Pagar.me ou Stripe Connect no serviço de pagamentos. O checkout deve ser hospedado/tokenizado pelo gateway.</p></>}</div></div>;
}
