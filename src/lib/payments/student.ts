import { appUrl } from '@/lib/utils';

export async function createStudentChargeCheckout(input: {
  chargeId: string;
  amountCents: number;
  description: string;
  studentEmail?: string | null;
}) {
  const provider = process.env.STUDENT_PAYMENT_PROVIDER || 'mock';

  // Produção: aqui entra Mercado Pago, Pagar.me, Stripe Connect ou outro gateway.
  // O PersonalOS nunca armazena cartão: use checkout hospedado/tokenização do gateway.
  return {
    provider,
    checkoutUrl: appUrl(`/pagar/${input.chargeId}?mock=1`),
    externalId: `mock_student_charge_${input.chargeId}`
  };
}
