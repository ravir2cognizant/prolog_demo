import { store } from '../store/memoryStore.js';
import type { FiscalYear, Period } from '../domain/types.js';
import { notFound, conflict, unprocessable } from '../util/errors.js';
import { newId, nowIso } from '../util/ids.js';

export function listFiscalYears(companyId: string): FiscalYear[] {
  return Array.from(store.fiscalYears.values()).filter((fy) => fy.companyId === companyId);
}

export function createFiscalYear(
  body: { companyId: string; name: string; startDate: string; endDate: string; periodCount: 12 | 13 },
  _userId: string,
): FiscalYear & { periodCount: number } {
  for (const fy of store.fiscalYears.values()) {
    if (fy.companyId === body.companyId && fy.startDate <= body.endDate && body.startDate <= fy.endDate) {
      throw conflict('YEAR_OVERLAP', 'Date range overlaps with an existing fiscal year');
    }
  }
  const now = nowIso();
  const fyId = newId();
  const fy: FiscalYear = {
    id: fyId,
    companyId: body.companyId,
    name: body.name,
    startDate: body.startDate,
    endDate: body.endDate,
    periodCount: body.periodCount,
    status: 'Open',
    createdAt: now,
  };
  store.fiscalYears.set(fyId, fy);

  // Generate periods
  const start = new Date(body.startDate);
  const count = body.periodCount;
  for (let i = 0; i < count; i++) {
    const pStart = new Date(start);
    pStart.setMonth(start.getMonth() + i);
    const pEnd = new Date(pStart);
    pEnd.setMonth(pEnd.getMonth() + 1);
    pEnd.setDate(pEnd.getDate() - 1);
    const pid = newId();
    const p: Period = {
      id: pid,
      fiscalYearId: fyId,
      name: `Period ${i + 1} - ${pStart.toLocaleString('en-US', { month: 'short' })} ${pStart.getFullYear()}`,
      startDate: pStart.toISOString().slice(0, 10),
      endDate: pEnd.toISOString().slice(0, 10),
      status: 'Open',
      sequence: i + 1,
    };
    store.periods.set(pid, p);
  }

  return { ...fy, periodCount: count };
}

export function listPeriods(fiscalYearId: string): { fiscalYearId: string; items: Period[] } {
  if (!store.fiscalYears.has(fiscalYearId)) throw notFound(`Fiscal year ${fiscalYearId} not found`);
  const items = Array.from(store.periods.values())
    .filter((p) => p.fiscalYearId === fiscalYearId)
    .sort((a, b) => a.sequence - b.sequence);
  return { fiscalYearId, items };
}

function getPeriodInYear(fiscalYearId: string, periodId: string): Period {
  if (!store.fiscalYears.has(fiscalYearId)) throw notFound(`Fiscal year ${fiscalYearId} not found`);
  const p = store.periods.get(periodId);
  if (!p || p.fiscalYearId !== fiscalYearId) throw notFound(`Period ${periodId} not found in fiscal year ${fiscalYearId}`);
  return p;
}

export function openPeriod(fiscalYearId: string, periodId: string): { periodId: string; status: string; updatedAt: string } {
  const fy = store.fiscalYears.get(fiscalYearId);
  if (!fy) throw notFound(`Fiscal year ${fiscalYearId} not found`);
  if (fy.status === 'YearEndClosed') throw conflict('YEAR_END_CLOSED', 'Cannot reopen a period in a year-end closed fiscal year');
  const p = getPeriodInYear(fiscalYearId, periodId);
  if (p.status === 'Open') throw conflict('ALREADY_OPEN', 'Period is already Open');
  const updatedAt = nowIso();
  store.periods.set(periodId, { ...p, status: 'Open' });
  return { periodId, status: 'Open', updatedAt };
}

export function closePeriod(fiscalYearId: string, periodId: string): { periodId: string; status: string; updatedAt: string } {
  const fy = store.fiscalYears.get(fiscalYearId);
  if (!fy) throw notFound(`Fiscal year ${fiscalYearId} not found`);
  const p = getPeriodInYear(fiscalYearId, periodId);
  if (p.status === 'Closed') throw conflict('ALREADY_CLOSED', 'Period is already Closed');
  const updatedAt = nowIso();
  store.periods.set(periodId, { ...p, status: 'Closed' });
  return { periodId, status: 'Closed', updatedAt };
}

export function yearEndClose(fiscalYearId: string, _userId: string) {
  const fy = store.fiscalYears.get(fiscalYearId);
  if (!fy) throw notFound(`Fiscal year ${fiscalYearId} not found`);
  if (fy.status === 'YearEndClosed') throw conflict('ALREADY_CLOSED', 'Fiscal year is already year-end closed');

  const unposted = Array.from(store.journalEntries.values()).filter(
    (je) => je.companyId === fy.companyId && je.status !== 'Posted' &&
      je.transactionDate >= fy.startDate && je.transactionDate <= fy.endDate,
  );
  if (unposted.length > 0) {
    throw unprocessable('UNPOSTED_ENTRIES_EXIST', 'One or more periods have unposted entries; must post or delete before closing');
  }

  // Close all open periods
  for (const p of store.periods.values()) {
    if (p.fiscalYearId === fiscalYearId && p.status === 'Open') {
      store.periods.set(p.id, { ...p, status: 'Closed' });
    }
  }

  const closedAt = nowIso();
  store.fiscalYears.set(fiscalYearId, { ...fy, status: 'YearEndClosed' });

  const carryForwardCount = Array.from(store.accounts.values()).filter(
    (a) => a.companyId === fy.companyId && ['asset', 'liability', 'equity'].includes(a.type),
  ).length;

  return { fiscalYearId, status: 'YearEndClosed', closedAt, carryForwardCount };
}
