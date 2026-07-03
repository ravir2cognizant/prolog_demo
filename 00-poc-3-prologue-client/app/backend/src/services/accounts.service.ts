import { store } from '../store/memoryStore.js';
import type { Account, AccountType } from '../domain/types.js';
import { AppError, notFound, conflict } from '../util/errors.js';
import { newId, nowIso } from '../util/ids.js';
import { offsetPage } from '../util/paging.js';

const CODE_PATTERN = /^\d+-\d+-\d+-\d+-\d+$/;

export function searchAccounts(query: { companyId: string; search?: string; activeOnly?: boolean; type?: AccountType; page: number; pageSize: number }) {
  let all = Array.from(store.accounts.values()).filter((a) => a.companyId === query.companyId);
  if (query.activeOnly) all = all.filter((a) => a.active);
  if (query.type) all = all.filter((a) => a.type === query.type);
  if (query.search) {
    const q = query.search.toLowerCase();
    all = all.filter((a) => a.code.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }
  return offsetPage(all, query.page, query.pageSize);
}

export function getAccount(id: string): Account {
  const a = store.accounts.get(id);
  if (!a) throw notFound(`Account ${id} not found`);
  return a;
}

export function createAccount(
  body: { companyId: string; code: string; description: string; type: AccountType; active?: boolean },
  userId: string,
): Account {
  if (!CODE_PATTERN.test(body.code)) {
    throw new AppError(400, 'INVALID_CODE_FORMAT', 'Account code must match format N-NNN-NNNN-NNN-NN (e.g. 1-394-7005-008-96)');
  }
  for (const a of store.accounts.values()) {
    if (a.companyId === body.companyId && a.code === body.code) {
      throw conflict('CODE_CONFLICT', `Account code ${body.code} already exists for this company`);
    }
  }
  const now = nowIso();
  const account: Account = {
    id: newId(),
    companyId: body.companyId,
    code: body.code,
    description: body.description,
    type: body.type,
    active: body.active ?? true,
    createdAt: now,
    createdByUserId: userId,
    updatedAt: now,
    updatedByUserId: userId,
  };
  store.accounts.set(account.id, account);
  return account;
}

export function updateAccount(
  id: string,
  body: { description?: string; type?: AccountType; active?: boolean },
  userId: string,
): Account {
  const a = getAccount(id);
  const now = nowIso();
  const updated: Account = {
    ...a,
    description: body.description ?? a.description,
    type: body.type ?? a.type,
    active: body.active ?? a.active,
    updatedAt: now,
    updatedByUserId: userId,
  };
  store.accounts.set(id, updated);
  return updated;
}

export function getAccountBalances(id: string, fiscalYearId: string) {
  const acct = getAccount(id);
  const fy = store.fiscalYears.get(fiscalYearId);
  if (!fy) throw notFound(`Fiscal year ${fiscalYearId} not found`);
  const periods = Array.from(store.periods.values())
    .filter((p) => p.fiscalYearId === fiscalYearId)
    .sort((a, b) => a.sequence - b.sequence);

  let running = 0;
  const periodBalances = periods.map((p) => {
    const jeLines = Array.from(store.journalEntries.values())
      .filter((je) => je.status === 'Posted' && je.transactionDate >= p.startDate && je.transactionDate <= p.endDate)
      .flatMap((je) => je.lines.filter((l) => l.accountId === id));
    const debit = jeLines.reduce((s, l) => s + l.debit, 0);
    const credit = jeLines.reduce((s, l) => s + l.credit, 0);
    const openingBalance = running;
    running = running + debit - credit;
    return { periodId: p.id, periodName: p.name, openingBalance, debit, credit, closingBalance: running };
  });

  return {
    accountId: id,
    accountCode: acct.code,
    accountDescription: acct.description,
    fiscalYearId,
    periods: periodBalances,
  };
}
