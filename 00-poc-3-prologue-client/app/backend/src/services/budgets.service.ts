import { store } from '../store/memoryStore.js';
import { notFound } from '../util/errors.js';
import { nowIso } from '../util/ids.js';

export function getBudgets(companyId: string, fiscalYear: number) {
  const fy = Array.from(store.fiscalYears.values()).find((f) => f.companyId === companyId && f.name.includes(String(fiscalYear)));
  const periods = fy
    ? Array.from(store.periods.values()).filter((p) => p.fiscalYearId === fy.id).sort((a, b) => a.sequence - b.sequence)
    : [];
  const key = `${companyId}:${fiscalYear}`;
  const budget = store.budgets.get(key);
  return {
    companyId,
    fiscalYear,
    periods: periods.map((p) => ({ id: p.id, name: p.name })),
    rows: budget?.rows ?? [],
  };
}

export function updateBudgets(
  body: { companyId: string; fiscalYear: number; updates: Array<{ accountId: string; periodId: string; amount: number }> },
) {
  const key = `${body.companyId}:${body.fiscalYear}`;
  const budget = store.budgets.get(key) ?? { companyId: body.companyId, fiscalYear: body.fiscalYear, rows: [] };

  for (const update of body.updates) {
    let row = budget.rows.find((r) => r.accountId === update.accountId);
    if (!row) {
      const acct = store.accounts.get(update.accountId);
      row = { accountId: update.accountId, accountCode: acct?.code ?? '', accountDescription: acct?.description ?? '', budgets: [] };
      budget.rows.push(row);
    }
    const cell = row.budgets.find((b) => b.periodId === update.periodId);
    if (cell) {
      cell.amount = update.amount;
    } else {
      row.budgets.push({ periodId: update.periodId, amount: update.amount });
    }
  }
  store.budgets.set(key, budget);
  return { updatedCount: body.updates.length, updatedAt: nowIso() };
}

export function importBudgets(companyId: string, fiscalYear: number, _fileBuffer: Buffer) {
  // Simulate import: accept and return a mock result
  return { importedCount: 10, errorCount: 0, errors: [] };
}

export function exportBudgets(companyId: string, fiscalYear: number, format: string): { content: string; contentType: string; filename: string } {
  const data = getBudgets(companyId, fiscalYear);
  const header = 'accountId,accountCode,accountDescription,' + data.periods.map((p) => p.name).join(',') + '\n';
  const rows = data.rows.map((r) => {
    const amounts = data.periods.map((p) => r.budgets.find((b) => b.periodId === p.id)?.amount ?? 0).join(',');
    return `${r.accountId},${r.accountCode},"${r.accountDescription}",${amounts}`;
  }).join('\n');
  const ext = format === 'xlsx' ? 'xlsx' : 'csv';
  return {
    content: header + rows,
    contentType: format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
    filename: `budget-${companyId}-${fiscalYear}.${ext}`,
  };
}
