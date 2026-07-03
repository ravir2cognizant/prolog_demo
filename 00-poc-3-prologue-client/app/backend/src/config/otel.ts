import { env } from './env.js';

export function initOtel(): void {
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    return;
  }
  // Dynamic import keeps the OTel SDK out of the bundle when disabled.
  // Module may not be installed; swallow all errors.
  const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<Record<string, unknown>>;
  dynamicImport('@opentelemetry/sdk-node').then((mod) => {
    const NodeSDK = mod['NodeSDK'] as new (o: { serviceName: string }) => { start(): void };
    new NodeSDK({ serviceName: env.OTEL_SERVICE_NAME }).start();
  }).catch(() => undefined);
}
