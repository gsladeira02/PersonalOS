import { appUrl } from '@/lib/utils';
import { PERSONAL_OS_PLANS, type PlanCode } from '@/lib/plans';

export type CheckoutResult = {
  provider: string;
  checkoutUrl: string;
  externalId: string;
};

export async function createSaasCheckout(input: {
  trainerId: string;
  subscriptionId: string;
  planCode: PlanCode;
  customerEmail: string;
  customerName: string;
}): Promise<CheckoutResult> {
  const provider = process.env.PAYMENT_PROVIDER || 'mock';
  const plan = PERSONAL_OS_PLANS[input.planCode];

  if (provider === 'mercadopago' && process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: `PersonalOS ${plan.name}`,
        external_reference: input.subscriptionId,
        payer_email: input.customerEmail,
        back_url: appUrl(`/checkout/sucesso?subscription_id=${input.subscriptionId}`),
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: plan.priceCents / 100,
          currency_id: 'BRL'
        }
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro no Mercado Pago: ${text}`);
    }

    const data = await res.json();
    return {
      provider,
      checkoutUrl: data.init_point || data.sandbox_init_point,
      externalId: data.id
    };
  }

  const token = encodeURIComponent(input.subscriptionId);
  return {
    provider: 'mock',
    checkoutUrl: appUrl(`/checkout/sucesso?subscription_id=${token}&mock=1`),
    externalId: `mock_saas_${input.subscriptionId}`
  };
}
