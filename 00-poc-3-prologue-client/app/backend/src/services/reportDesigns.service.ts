import { store } from '../store/memoryStore.js';
import type { ReportDesign, ReportRowDefinition } from '../domain/types.js';
import { notFound, conflict } from '../util/errors.js';
import { newId, nowIso } from '../util/ids.js';

export function listReportDesigns(search?: string): ReportDesign[] {
  let all = Array.from(store.reportDesigns.values());
  if (search) {
    const q = search.toLowerCase();
    all = all.filter((d) => d.name.toLowerCase().includes(q));
  }
  return all;
}

export function saveReportDesign(
  body: { name: string; description?: string; rowDefinitions: ReportRowDefinition[]; columnPeriods: string[] },
  userId: string,
): ReportDesign {
  const existing = Array.from(store.reportDesigns.values()).find((d) => d.name === body.name && d.createdBy === userId);
  if (existing) throw conflict('NAME_CONFLICT', `A report design named "${body.name}" already exists`);
  const now = nowIso();
  const id = newId();
  const design: ReportDesign = {
    id,
    name: body.name,
    description: body.description ?? '',
    rowDefinitions: body.rowDefinitions,
    columnPeriods: body.columnPeriods,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  };
  store.reportDesigns.set(id, design);
  return design;
}

export function updateReportDesign(id: string, body: Partial<{ name: string; description: string; rowDefinitions: ReportRowDefinition[]; columnPeriods: string[] }>, _userId: string): ReportDesign {
  const d = store.reportDesigns.get(id);
  if (!d) throw notFound(`Report design ${id} not found`);
  const now = nowIso();
  const updated: ReportDesign = {
    ...d,
    name: body.name ?? d.name,
    description: body.description ?? d.description,
    rowDefinitions: body.rowDefinitions ?? d.rowDefinitions,
    columnPeriods: body.columnPeriods ?? d.columnPeriods,
    updatedAt: now,
  };
  store.reportDesigns.set(id, updated);
  return updated;
}

export function runReportDesign(id: string, dataSourceType: string) {
  const d = store.reportDesigns.get(id);
  if (!d) throw notFound(`Report design ${id} not found`);

  const rows = d.rowDefinitions.map((row) => ({
    label: row.label,
    values: d.columnPeriods.map((periodId) => {
      const period = store.periods.get(periodId);
      let balance = 0;
      if (row.accountId) {
        const jeLines = Array.from(store.journalEntries.values())
          .filter((je) => je.status === 'Posted' && period && je.transactionDate >= period.startDate && je.transactionDate <= period.endDate)
          .flatMap((je) => je.lines.filter((l) => l.accountId === row.accountId));
        balance = jeLines.reduce((s, l) => s + l.debit - l.credit, 0);
      }
      return { periodId, periodName: period?.name ?? periodId, balance, allocated: 0 };
    }),
  }));

  return { reportDesignId: id, generatedAt: nowIso(), rows };
  void dataSourceType;
}

export function exportReport(id: string, format: string): { content: string; contentType: string; filename: string } {
  const d = store.reportDesigns.get(id);
  if (!d) throw notFound(`Report design ${id} not found`);
  const result = runReportDesign(id, 'operational');
  const header = `label,${d.columnPeriods.join(',')}\n`;
  const rows = result.rows.map((r) => `"${r.label}",${r.values.map((v) => v.balance).join(',')}`).join('\n');
  const ext = format === 'pdf' ? 'pdf' : 'xlsx';
  return {
    content: header + rows,
    contentType: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filename: `${d.name.replace(/\s+/g, '-')}-${nowIso().slice(0, 10)}.${ext}`,
  };
}
