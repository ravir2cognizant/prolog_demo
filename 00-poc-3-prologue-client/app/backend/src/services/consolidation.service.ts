import { store } from '../store/memoryStore.js';
import type { ConsolidationSource, ConsolidationRun } from '../domain/types.js';
import { notFound, conflict } from '../util/errors.js';
import { newId, nowIso } from '../util/ids.js';
import { offsetPage } from '../util/paging.js';

export function listConsolidationSources() {
  return { items: Array.from(store.consolidationSources.values()) };
}

export function addConsolidationSource(
  body: { name: string; sourceType: 'database' | 'file'; connectionConfig: Record<string, unknown> },
  _userId: string,
): ConsolidationSource {
  const now = nowIso();
  const id = newId();
  const src: ConsolidationSource = {
    id,
    name: body.name,
    sourceType: body.sourceType,
    status: 'Active',
    connectionConfig: body.connectionConfig,
    lastRunAt: null,
    createdAt: now,
  };
  store.consolidationSources.set(id, src);
  return src;
}

export function runConsolidation(body: { fiscalYear: number; periodId?: string }, _userId: string): ConsolidationRun {
  const inProgress = Array.from(store.consolidationRuns.values()).some((r) => r.status === 'PartialSuccess' && !r.completedAt);
  if (inProgress) throw conflict('RUN_IN_PROGRESS', 'A consolidation run is already in progress');

  const sources = Array.from(store.consolidationSources.values()).filter((s) => s.status === 'Active');
  const now = nowIso();
  const runId = newId();

  const sourceResults = sources.map((s) => ({
    sourceId: s.id,
    sourceName: s.name,
    status: 'Success' as const,
    recordsProcessed: Math.floor(Math.random() * 1000) + 100,
    errors: [],
  }));

  // Update lastRunAt on each source
  for (const s of sources) {
    store.consolidationSources.set(s.id, { ...s, lastRunAt: now });
  }

  const run: ConsolidationRun = {
    id: runId,
    status: 'Completed',
    fiscalYear: body.fiscalYear,
    periodId: body.periodId ?? null,
    startedAt: now,
    completedAt: now,
    sourceCount: sources.length,
    errorCount: 0,
    sources: sourceResults,
  };
  store.consolidationRuns.set(runId, run);
  return run;
}

export function listConsolidationRuns(page: number, pageSize: number) {
  const all = Array.from(store.consolidationRuns.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return offsetPage(all, page, pageSize);
}

export function getConsolidationRunReport(id: string) {
  const run = store.consolidationRuns.get(id);
  if (!run) throw notFound(`Consolidation run ${id} not found`);
  return {
    runId: run.id,
    status: run.status,
    fiscalYear: run.fiscalYear,
    sources: run.sources,
  };
}
