'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { useStudentSession } from '@/hooks/useStudentSession';
import { Loading } from './Loading';

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { loading, student, signOut } = useStudentSession();

  if (loading) return <Loading text="Abrindo área do aluno..." />;
  if (!student) return null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <p className="small">Área do aluno</p>
        <nav className="side-menu">
          <Link href="/aluno">Início</Link>
          <a href="#treino">Meu treino</a>
          <a href="#evolucao">Minha evolução</a>
          <a href="#habitos">Hábitos</a>
          <a href="#pagamentos">Pagamentos</a>
          <a href="#saude">Conexões de Saúde</a>
          <button className="btn btn-secondary" onClick={signOut}>Sair</button>
        </nav>
      </aside>
      <main className="main">{children}</main>
      <nav className="mobile-tabs">
        <a href="#treino">Treino</a>
        <a href="#evolucao">Evolução</a>
        <a href="#habitos">Hábitos</a>
        <a href="#pagamentos">Pagar</a>
        <a href="#saude">Saúde</a>
      </nav>
    </div>
  );
}
