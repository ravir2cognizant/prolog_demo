import { buildApp } from '../app.js';
import { memoryStore } from '../store/memoryStore.js';

/**
 * buildTestApp -- spins up a fresh BFF app instance with the in-memory store
 * reseeded. Each Vitest spec calls this once in beforeAll().
 *
 * Env vars (AUTH_DEV_BYPASS=1, NODE_ENV=test, ENABLE_API_DOCS=1) are set via
 * vitest.config.ts test.env BEFORE modules load, so env.ts parses them correctly.
 *
 * Do NOT call clearEndpoints() here: route modules are static imports in app.ts,
 * so documented() calls fire once at import time. Vitest isolates each test file
 * in its own worker (fresh module cache), so the registry starts empty per file.
 */
export function buildTestApp() {
  memoryStore.reset();
  return buildApp({ reseed: true });
}
