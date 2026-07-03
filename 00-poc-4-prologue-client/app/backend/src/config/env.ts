import { z } from 'zod';

const truthy = (raw: string | undefined): boolean => {
  if (raw === undefined) return false;
  return raw === '1' || raw.toLowerCase() === 'true' || raw.toLowerCase() === 'yes';
};

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  BODY_LIMIT: z.string().default('100kb'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  AUTH_DEV_BYPASS: z.string().optional(),
  JWKS_URI: z.string().optional().default(''),
  JWT_ISSUER: z.string().optional().default(''),
  JWT_AUDIENCE: z.string().optional().default(''),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional().default(''),
  ENABLE_API_DOCS: z.string().optional(),
});

const parsed = EnvSchema.parse(process.env);

const authDevBypass = truthy(parsed.AUTH_DEV_BYPASS);
const enableApiDocs = parsed.ENABLE_API_DOCS === undefined ? true : truthy(parsed.ENABLE_API_DOCS);

if (authDevBypass && parsed.NODE_ENV === 'production') {
  // Hard-fail boot: dev bypass is never allowed in production.
  throw new Error(
    'AUTH_DEV_BYPASS=1 is forbidden when NODE_ENV=production. Disable the bypass or change NODE_ENV.',
  );
}

export const env = {
  NODE_ENV: parsed.NODE_ENV,
  PORT: parsed.PORT,
  CORS_ORIGIN: parsed.CORS_ORIGIN,
  BODY_LIMIT: parsed.BODY_LIMIT,
  LOG_LEVEL: parsed.LOG_LEVEL,
  AUTH_DEV_BYPASS: authDevBypass,
  JWKS_URI: parsed.JWKS_URI ?? '',
  JWT_ISSUER: parsed.JWT_ISSUER ?? '',
  JWT_AUDIENCE: parsed.JWT_AUDIENCE ?? '',
  OTEL_EXPORTER_OTLP_ENDPOINT: parsed.OTEL_EXPORTER_OTLP_ENDPOINT ?? '',
  ENABLE_API_DOCS: enableApiDocs,
} as const;

export type Env = typeof env;
