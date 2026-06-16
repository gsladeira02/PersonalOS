import { NextResponse } from 'next/server';
import { HEALTH_PROVIDERS, type HealthProvider } from '@/lib/health/providers';

export async function GET(_: Request, context: { params: { provider: string } }) {
  const provider = context.params.provider as HealthProvider;
  const meta = HEALTH_PROVIDERS[provider];
  if (!meta) return NextResponse.json({ error: 'Provider inválido.' }, { status: 404 });

  if (provider === 'strava' && process.env.STRAVA_CLIENT_ID) {
    const redirect = encodeURIComponent(process.env.STRAVA_CALLBACK_URL || '');
    const url = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${redirect}&approval_prompt=auto&scope=read,activity:read_all`;
    return NextResponse.redirect(url);
  }

  return NextResponse.json({
    status: 'needs_configuration',
    provider,
    name: meta.name,
    message: meta.requiresNative
      ? 'Esta integração exige camada nativa iOS/Android. A estrutura de banco, consentimento e sincronização já está pronta.'
      : 'Configure as credenciais do provider para ativar o OAuth.'
  });
}
