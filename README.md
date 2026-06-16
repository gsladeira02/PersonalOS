# PersonalOS

Sistema SaaS para personal trainers, treinadores online, studios pequenos e consultorias fitness.

Este projeto foi preparado para GitHub + Vercel + Supabase.

## Stack

- Next.js App Router
- React + TypeScript
- Supabase Auth
- Supabase Postgres com RLS
- Supabase Storage privado para vídeos
- Rotas API para checkout, webhooks, vídeos assinados e saúde

## O que já vem no projeto

- Landing page pública
- Cadastro do personal com plano
- Checkout mock da assinatura SaaS
- Bloqueio por assinatura pendente/atrasada
- Login com redirecionamento por tipo de usuário
- Painel do personal
- CRUD de alunos com convite
- Área do aluno por convite
- Biblioteca de exercícios
- Upload de vídeos próprios do personal
- Player com URL assinada
- Criador de treinos
- Execução de treino pelo aluno
- Anamnese
- Avaliações físicas
- Hábitos
- Agenda e exceções
- Mensagens
- Planos vendidos pelo personal
- Cobranças dos alunos
- Link público de pagamento mock
- Financeiro com CSV
- Gateway de pagamento preparado
- Saúde/relógios preparado para Apple Health, Health Connect, Garmin e Strava
- SQL com tabelas, RLS e storage privado

## 1. Criar projeto no Supabase

1. Crie um projeto novo no Supabase.
2. Vá em **SQL Editor**.
3. Cole e execute o arquivo:

```bash
supabase/schema.sql
```

4. Vá em **Project Settings > API** e copie:

- Project URL
- anon public key
- service_role key

## 2. Configurar variáveis

Copie `.env.example` para `.env.local` no desenvolvimento local.

```bash
cp .env.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
PAYMENT_PROVIDER=mock
DEV_AUTO_APPROVE_CHECKOUT=true
VIDEO_BUCKET=trainer-videos
MAX_VIDEO_UPLOAD_MB=250
SIGNED_VIDEO_URL_TTL_SECONDS=3600
CRON_SECRET=troque-esse-segredo
```

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra:

```bash
http://localhost:3000
```

## 4. Fluxo de teste

1. Acesse a landing page.
2. Clique em **Começar agora**.
3. Cadastre o personal.
4. No checkout mock, clique em **Aprovar pagamento mock**.
5. Faça login.
6. Cadastre um aluno.
7. Copie o link de convite do aluno.
8. Abra o convite em outra aba e crie o acesso do aluno.
9. No painel do personal, cadastre exercícios e envie vídeos próprios.
10. Crie um treino para o aluno.
11. Entre como aluno, assista ao vídeo e conclua o treino.

## 5. Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente na Vercel usando `.env.example`.
4. Em produção, altere:

```env
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

5. Faça deploy.

## 6. Pagamentos reais

O projeto vem com modo `mock` para testes. Para produção, conecte um gateway real:

- Mercado Pago para assinatura SaaS e/ou cobranças.
- Pagar.me ou Stripe Connect para conta recebedora do personal.
- Webhooks já têm rotas separadas:
  - `/api/webhooks/saas`
  - `/api/webhooks/student-payments`

O PersonalOS nunca deve armazenar dados de cartão. Use checkout hospedado, tokenização ou checkout do gateway.

## 7. Relógios e apps de saúde

A estrutura está pronta desde a V1, mas algumas integrações exigem requisitos externos:

- Apple Health / Apple Watch: exige app/camada nativa iOS com HealthKit.
- Health Connect / Wear OS: exige app/camada nativa Android.
- Garmin: exige aprovação e credenciais Garmin Health API.
- Strava: exige OAuth com `STRAVA_CLIENT_ID` e `STRAVA_CLIENT_SECRET`.

Rotas preparadas:

- `/api/health/connect/[provider]`
- `/api/health/sync`

## 8. Vídeos próprios

O bucket `trainer-videos` é privado. O personal faz upload para uma pasta com o próprio `trainer_id`. A reprodução usa URL assinada via:

```bash
/api/videos/signed-url?id=VIDEO_ID
```

Regras implementadas:

- MP4, MOV e WEBM
- Storage privado
- URLs assinadas
- Logs de upload
- Logs de visualização
- Isolamento por personal e aluno

## 9. Observações importantes

- O projeto é um MVP funcional e vendável como base inicial.
- Integrações externas precisam de credenciais reais e aprovação dos provedores.
- Antes de vender em produção, revise LGPD, termos de uso, política de privacidade, gateway real, e-mails transacionais e domínio.
