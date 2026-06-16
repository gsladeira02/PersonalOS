'use client';

import { useEffect, useState } from 'react';
import { TrainerShell } from '@/components/TrainerShell';
import { useTrainerSession } from '@/hooks/useTrainerSession';
import { moneyFromCents } from '@/lib/access';

type Dashboard = {
  students: number;
  workouts: number;
  pendingCharges: number;
  paidRevenue: number;
  appointments: number;
  healthConnections: number;
};

export default function TrainerDashboardPage() {
  return <TrainerShell><DashboardContent /></TrainerShell>;
}

function DashboardContent() {
  const { trainer, supabase } = useTrainerSession();
  const [data, setData] = useState<Dashboard>({ students: 0, workouts: 0, pendingCharges: 0, paidRevenue: 0, appointments: 0, healthConnections: 0 });

  useEffect(() => {
    if (!trainer) return;
    async function load() {
      const [students, workouts, charges, paid, appointments, health] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('trainer_id', trainer.id).eq('status', 'active'),
        supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('trainer_id', trainer.id),
        supabase.from('student_charges').select('id', { count: 'exact', head: true }).eq('trainer_id', trainer.id).in('status', ['pending', 'overdue']),
        supabase.from('student_charges').select('amount_cents').eq('trainer_id', trainer.id).eq('status', 'paid'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('trainer_id', trainer.id).gte('start_time', new Date().toISOString().slice(0, 10)),
        supabase.from('health_connections').select('id', { count: 'exact', head: true }).eq('trainer_id', trainer.id).eq('status', 'connected')
      ]);
      const paidRevenue = (paid.data || []).reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);
      setData({
        students: students.count || 0,
        workouts: workouts.count || 0,
        pendingCharges: charges.count || 0,
        paidRevenue,
        appointments: appointments.count || 0,
        healthConnections: health.count || 0
      });
    }
    load();
  }, [trainer, supabase]);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Painel do personal</span>
          <h1>Dashboard</h1>
          <p>Visão rápida de alunos, treinos, agenda, pagamentos e dados de saúde.</p>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="card kpi"><span>Alunos ativos</span><strong>{data.students}</strong></div>
        <div className="card kpi"><span>Treinos criados</span><strong>{data.workouts}</strong></div>
        <div className="card kpi"><span>Pagamentos pendentes</span><strong>{data.pendingCharges}</strong></div>
        <div className="card kpi"><span>Receita recebida</span><strong>{moneyFromCents(data.paidRevenue)}</strong></div>
      </div>
      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card panel-card">
          <h3>Alertas</h3>
          <p>Alunos sem atividade recente, cobranças atrasadas, queda de consistência e sono abaixo do padrão aparecerão aqui quando houver dados suficientes.</p>
        </div>
        <div className="card panel-card">
          <h3>Atalhos rápidos</h3>
          <div className="actions">
            <a className="btn btn-primary" href="/personal/alunos">Cadastrar aluno</a>
            <a className="btn btn-secondary" href="/personal/treinos">Criar treino</a>
            <a className="btn btn-secondary" href="/personal/pagamentos">Criar cobrança</a>
          </div>
        </div>
      </div>
    </>
  );
}
