export type HealthProvider = 'apple_health' | 'health_connect' | 'garmin' | 'strava';

export const HEALTH_PROVIDERS: Record<HealthProvider, { name: string; description: string; requiresNative: boolean }> = {
  apple_health: {
    name: 'Apple Health / Apple Watch',
    description: 'Exige app/camada nativa iOS com HealthKit para leitura autorizada dos dados.',
    requiresNative: true
  },
  health_connect: {
    name: 'Health Connect / Wear OS',
    description: 'Exige app/camada nativa Android com Health Connect.',
    requiresNative: true
  },
  garmin: {
    name: 'Garmin Health API',
    description: 'Fluxo OAuth/API com aprovação da Garmin e callbacks seguros.',
    requiresNative: false
  },
  strava: {
    name: 'Strava',
    description: 'OAuth para atividades físicas complementares.',
    requiresNative: false
  }
};
