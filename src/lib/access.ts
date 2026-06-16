export type TrainerAccessStatus = 'active' | 'pending' | 'past_due' | 'blocked' | 'canceled';

export function trainerCanAccess(trainer: { subscription_status?: string | null; grace_until?: string | null }) {
  if (trainer.subscription_status === 'active') return true;
  if (trainer.subscription_status === 'past_due' && trainer.grace_until) {
    return new Date(trainer.grace_until).getTime() > Date.now();
  }
  return false;
}

export function moneyFromCents(cents: number | null | undefined) {
  const value = (cents || 0) / 100;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
