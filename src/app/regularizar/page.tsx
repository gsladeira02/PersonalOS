'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

export default function RegularizarPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [subscriptionId, setSubscriptionId] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: trainer } = await supabase.from('trainers').select('id').eq('user_id', data.user.id).single();
      if (!trainer) return;
      const { data: sub } = await supabase.from('subscriptions').select('id').eq('trainer_id', trainer.id).order('created_at', { ascending: false }).limit(1).single();
      if (sub) setSubscriptionId(sub.id);
    });
  }, [supabase]);

  async function pay() {
    const res = await fetch('/api/checkout/saas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription_id: subscriptionId })
    });
    const data = await res.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
  }

  return (
    <div className="form-page">
      <div className="card form-card">
        <Logo />
        <h1>Regularize sua assinatura</h1>
        <p>Seu acesso está pendente, atrasado ou fora do período de tolerância de 3 dias. Regularize para voltar ao painel.</p>
        <button className="btn btn-primary" onClick={pay} disabled={!subscriptionId}>Ir para pagamento</button>
      </div>
    </div>
  );
}
