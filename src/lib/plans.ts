export type PlanCode = 'inicial' | 'profissional' | 'premium';

export const PERSONAL_OS_PLANS: Record<PlanCode, {
  code: PlanCode;
  name: string;
  price: string;
  priceCents: number;
  studentLimit: number | null;
  description: string;
  features: string[];
}> = {
  inicial: {
    code: 'inicial',
    name: 'Inicial',
    price: 'R$ 49,90/mês',
    priceCents: 4990,
    studentLimit: 10,
    description: 'Para começar com poucos alunos e treinos organizados.',
    features: ['Até 10 alunos ativos', 'Treinos personalizados', 'Agenda', 'Acompanhamento básico', 'Cobrança manual dos alunos']
  },
  profissional: {
    code: 'profissional',
    name: 'Profissional',
    price: 'R$ 79,90/mês',
    priceCents: 7990,
    studentLimit: 40,
    description: 'Para vender consultoria, acompanhar evolução e usar vídeos próprios.',
    features: ['Até 40 alunos ativos', 'Upload de vídeos próprios', 'Avaliações físicas', 'Mensagens', 'Hábitos', 'Integração com relógios', 'Cobrança dos alunos pelo app']
  },
  premium: {
    code: 'premium',
    name: 'Premium',
    price: 'R$ 119,90/mês',
    priceCents: 11990,
    studentLimit: null,
    description: 'Para operação completa com automações, relatórios e metas inteligentes.',
    features: ['Alunos ilimitados', 'Automações', 'Relatórios completos', 'Área do aluno completa', 'Upload de vídeos próprios', 'Integração com relógios', 'Metas inteligentes']
  }
};

export function getPlan(code: string | null | undefined) {
  if (code && code in PERSONAL_OS_PLANS) return PERSONAL_OS_PLANS[code as PlanCode];
  return PERSONAL_OS_PLANS.profissional;
}
