'use client';

export const dynamic = 'force-dynamic';

import { TrainerShell } from '@/components/TrainerShell';

export default function RelatoriosPage(){ return <TrainerShell><div className="page-head"><div><span className="eyebrow">Relatórios</span><h1>Relatórios</h1><p>Cards e gráficos simples para acompanhar alunos, treinos, receita, inadimplência e saúde.</p></div></div><div className="grid-3"><div className="card panel-card"><h3>Alunos mais ativos</h3><p>Baseado em workout_logs e habit_logs.</p></div><div className="card panel-card"><h3>Treinos concluídos</h3><p>Frequência por aluno e comparação planejado x realizado.</p></div><div className="card panel-card"><h3>Financeiro</h3><p>Receita mensal, prevista, pendente e inadimplência.</p></div><div className="card panel-card"><h3>Dados de relógios</h3><p>Passos, sono, frequência cardíaca e metas cumpridas.</p></div><div className="card panel-card"><h3>Evolução corporal</h3><p>Histórico de avaliações e medidas.</p></div><div className="card panel-card"><h3>Agenda da semana</h3><p>Atendimentos confirmados, pendentes e cancelados.</p></div></div></TrainerShell>; }
