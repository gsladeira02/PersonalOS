'use client';

import { TrainerShell } from '@/components/TrainerShell';

export default function NutricaoPage() {
  return <TrainerShell>
    <div className="page-head"><div><span className="eyebrow">Nutrição básica</span><h1>Nutrição básica</h1><p>Orientações gerais, diário alimentar por foto, metas de água e hábitos alimentares.</p></div></div>
    <div className="notice">Este recurso não substitui acompanhamento com nutricionista.</div>
    <div className="grid-3" style={{marginTop:18}}>
      <div className="card panel-card"><h3>Metas gerais</h3><p>Use hábitos para metas de água, proteína, refeições e registro alimentar.</p></div>
      <div className="card panel-card"><h3>Diário alimentar</h3><p>A tabela food_logs está pronta para receber fotos e observações do aluno.</p></div>
      <div className="card panel-card"><h3>Orientações</h3><p>Cadastre orientações simples sem prescrição clínica avançada.</p></div>
    </div>
  </TrainerShell>;
}
