import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  AUTH_DEV_BYPASS: z.string().default('1').transform((v) => v === '1'),
  JWKS_URI: z.string().default(''),
  JWT_ISSUER: z.string().default(''),
  JWT_AUDIENCE: z.string().default(''),
  LOG_LEVEL: z.string().default('info'),
  ENABLE_API_DOCS: z.string().default('1').transform((v) => v === '1'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default(''),
  OTEL_SERVICE_NAME: z.string().default('prologue-bff'),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid env config', parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
