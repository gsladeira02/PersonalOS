import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { PERSONAL_OS_PLANS } from '@/lib/plans';

const features = [
  ['Alunos', 'Cadastre alunos, objetivos, lesões, planos e convites para acesso próprio.'],
  ['Treinos', 'Monte treinos A/B/C/D/E com séries, carga, descanso, vídeos e histórico.'],
  ['Vídeos próprios', 'Faça upload de vídeos do personal com storage privado e reprodução segura.'],
  ['Pagamentos', 'Assinatura SaaS separada das cobranças feitas pelo personal aos alunos.'],
  ['Relógios', 'Estrutura pronta para Apple Health, Health Connect, Garmin e Strava.'],
  ['Agenda', 'Horários disponíveis, exceções, bloqueios, aulas recorrentes e solicitações.']
];

export default function HomePage() {
  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <Logo />
          <nav className="nav-links">
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#planos">Planos</a>
            <a href="#faq">FAQ</a>
            <Link className="btn btn-secondary" href="/login">Entrar</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">SistemasOS para fitness</span>
              <h1>O sistema completo para personal trainers venderem mais e acompanharem melhor.</h1>
              <p className="lead">Gerencie seus alunos, treinos, agenda, pagamentos e evolução em um só lugar.</p>
              <div className="actions">
                <Link className="btn btn-primary" href="/cadastro?plano=profissional">Começar agora</Link>
                <a className="btn btn-secondary" href="https://wa.me/5500000000000" target="_blank">Falar no WhatsApp</a>
              </div>
            </div>
            <div className="card hero-card">
              <div className="stat-grid">
                <div className="stat"><strong>40+</strong><span>alunos no plano profissional</span></div>
                <div className="stat"><strong>100%</strong><span>mobile-first para aluno treinar no celular</span></div>
                <div className="stat"><strong>2</strong><span>fluxos financeiros separados</span></div>
                <div className="stat"><strong>4</strong><span>integrações de saúde preparadas</span></div>
              </div>
              <p>Treinos, vídeos próprios, hábitos, avaliações, pagamentos, agenda e dados de relógios em uma experiência simples.</p>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="section">
          <div className="container">
            <span className="eyebrow">Produto vendável</span>
            <h2>Mais que um app de treino.</h2>
            <div className="grid-3">
              {features.map(([title, body]) => (
                <div className="card feature" key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2">
            <div className="card feature">
              <span className="badge">Relógios e saúde</span>
              <h2>Integrações preparadas desde a V1.</h2>
              <p>Apple Health/Watch, Health Connect/Wear OS, Garmin e Strava com tabelas, callbacks, consentimento, logs e sincronização agendada. Onde a API exigir aprovação ou app nativo, a estrutura já fica pronta para conectar.</p>
            </div>
            <div className="card feature">
              <span className="badge">Cobrança dentro do app</span>
              <h2>O personal pode receber dos alunos.</h2>
              <p>Planos próprios, cobranças avulsas, recorrências, link de pagamento, webhooks, inadimplência e financeiro, separados da assinatura que o personal paga ao PersonalOS.</p>
            </div>
          </div>
        </section>

        <section id="planos" className="section">
          <div className="container">
            <span className="eyebrow">Planos mensais</span>
            <h2>Escolha o plano do personal.</h2>
            <div className="grid-3">
              {Object.values(PERSONAL_OS_PLANS).map(plan => (
                <div className="card price" key={plan.code}>
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                  <strong>{plan.price}</strong>
                  <ul>
                    {plan.features.map(feature => <li key={feature}>{feature}</li>)}
                  </ul>
                  <Link className="btn btn-primary" href={`/cadastro?plano=${plan.code}`}>Começar com {plan.name}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section">
          <div className="container grid-2">
            <div>
              <h2>Perguntas frequentes</h2>
              <p>O PersonalOS foi estruturado para deploy em Vercel e Supabase, com storage privado, autenticação, RLS e rotas de webhook.</p>
            </div>
            <div className="card feature">
              <h3>Posso usar vídeos próprios?</h3>
              <p>Sim. O upload próprio é a opção principal. Link externo é apenas alternativa secundária.</p>
              <h3>Já conecta relógios?</h3>
              <p>A V1 já possui estrutura real. Apple/Android dependem de app nativo; Garmin/Strava dependem de credenciais e aprovação.</p>
              <h3>Como funciona pagamento?</h3>
              <p>Há checkout para assinatura do SaaS e outro fluxo para o personal cobrar seus alunos.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="section">
        <div className="container">
          <Logo />
          <p>PersonalOS é parte da marca SistemasOS.</p>
        </div>
      </footer>
    </>
  );
}
