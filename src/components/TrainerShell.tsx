'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { useTrainerSession } from '@/hooks/useTrainerSession';
import { Loading } from './Loading';

const menu = [
  ['Dashboard', '/personal/dashboard'],
  ['Alunos', '/personal/alunos'],
  ['Treinos', '/personal/treinos'],
  ['Exercícios', '/personal/exercicios'],
  ['Agenda', '/personal/agenda'],
  ['Avaliações', '/personal/avaliacoes'],
  ['Hábitos', '/personal/habitos'],
  ['Nutrição básica', '/personal/nutricao'],
  ['Mensagens', '/personal/mensagens'],
  ['Pagamentos', '/personal/pagamentos'],
  ['Financeiro', '/personal/financeiro'],
  ['Relógios e Saúde', '/personal/saude'],
  ['Relatórios', '/personal/relatorios'],
  ['Configurações', '/personal/configuracoes']
];

export function TrainerShell({ children }: { children: React.ReactNode }) {
  const { loading, trainer, signOut } = useTrainerSession();

  if (loading) return <Loading text="Abrindo painel do personal..." />;
  if (!trainer) return null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <p className="small">{trainer.business_name || trainer.full_name}</p>
        <nav className="side-menu">
          {menu.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <button className="btn btn-secondary" onClick={signOut}>Sair</button>
        </nav>
      </aside>
      <main className="main">{children}</main>
      <nav className="mobile-tabs">
        <Link href="/personal/dashboard">Início</Link>
        <Link href="/personal/alunos">Alunos</Link>
        <Link href="/personal/treinos">Treinos</Link>
        <Link href="/personal/pagamentos">Pagamentos</Link>
        <Link href="/personal/configuracoes">Ajustes</Link>
      </nav>
    </div>
  );
}
