import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PersonalOS | SistemasOS',
  description: 'SaaS para personal trainers com treinos, vídeos, alunos, pagamentos e dados de saúde.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
