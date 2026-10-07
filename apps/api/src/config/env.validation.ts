export interface AppEnv {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  PORT: number;
  DEV_AUTH_ENABLED: boolean;
  LINE_LOGIN_CHANNEL_ID: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
  LIFF_ID: string;
  APP_BASE_URL: string;
  CORS_ORIGINS: string;
}

function readString(config: Record<string, unknown>, key: string, fallback = ''): string {
  const value = config[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

/** Fails fast at boot. Dev auth in production is a hard error, never a warning. */
export function validateEnv(config: Record<string, unknown>): AppEnv {
  const databaseUrl = readString(config, 'DATABASE_URL');
  const jwtSecret = readString(config, 'JWT_SECRET');
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  if (!jwtSecret) throw new Error('JWT_SECRET is required');

  const nodeEnv = readString(config, 'NODE_ENV', 'development');
  const isDevAuthEnabled = readString(config, 'DEV_AUTH_ENABLED') === 'true';
  if (nodeEnv === 'production' && isDevAuthEnabled) {
    throw new Error('DEV_AUTH_ENABLED=true is not allowed when NODE_ENV=production');
  }

  const appBaseUrl = readString(config, 'APP_BASE_URL', 'http://localhost:5173');
  return {
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    NODE_ENV: nodeEnv,
    PORT: Number(readString(config, 'PORT', '3000')),
    DEV_AUTH_ENABLED: isDevAuthEnabled,
    LINE_LOGIN_CHANNEL_ID: readString(config, 'LINE_LOGIN_CHANNEL_ID'),
    LINE_CHANNEL_ACCESS_TOKEN: readString(config, 'LINE_CHANNEL_ACCESS_TOKEN'),
    LINE_CHANNEL_SECRET: readString(config, 'LINE_CHANNEL_SECRET'),
    LIFF_ID: readString(config, 'LIFF_ID', readString(config, 'VITE_LIFF_ID')),
    APP_BASE_URL: appBaseUrl,
    CORS_ORIGINS: readString(config, 'CORS_ORIGINS', appBaseUrl),
  };
}
