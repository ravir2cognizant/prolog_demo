import { env } from './env.js';
import { logger } from './logger.js';

/**
 * OpenTelemetry initialisation.
 * Safe no-op when no OTLP endpoint is configured (dev default).
 * The full OTel SDK is intentionally not wired in this POC --
 * see ED design notes; this stub keeps the call site honest.
 */
export function initTelemetry(): void {
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    logger.debug({ event: 'otel.skip', reason: 'no_endpoint' }, 'OpenTelemetry disabled');
    return;
  }
  logger.info(
    { event: 'otel.init', endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT },
    'OpenTelemetry endpoint configured (no-op stub in POC)',
  );
}
