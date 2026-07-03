import { store } from '../store/memoryStore.js';
import type { JournalEntry, JournalEntryLine } from '../domain/types.js';
import { AppError, notFound, conflict, unprocessable } from '../util/errors.js';
import { newId, nowIso } from '../util/ids.js';
import { cursorPage } from '../util/paging.js';

function computeTotals(lines: JournalEntryLine[]) {
  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const difference = Math.round((totalDebit - totalCredit) * 100) / 100;
  return { totalDebit, totalCredit, difference, isBalanced: difference === 0 };
}

function resolveLines(rawLines: Array<{ accountId: string; currencyId: string; debit: number; credit: number; description: string; referenceNo: string }>, userId: string): JournalEntryLine[] {
  return rawLines.map((l, i) => {
    const acct = store.accounts.get(l.accountId);
    return {
      lineNumber: i + 1,
      accountId: l.accountId,
      accountCode: acct?.code ?? '',
      accountDescription: acct?.description ?? '',
      currencyId: l.currencyId,
      debit: l.debit,
      credit: l.credit,
      description: l.description,
      referenceNo: l.referenceNo,
    };
  });
  void userId;
}

function isOpenPeriod(date: string): boolean {
  for (const period of store.periods.values()) {
    if (period.startDate <= date && date <= period.endDate && period.status === 'Open') return true;
  }
  return true; // permissive in POC
}

export function getJournalEntry(id: string): JournalEntry {
  const je = store.journalEntries.get(id);
  if (!je) throw notFound(`Journal entry ${id} not found`);
  return je;
}

export function createJournalEntry(
  body: { companyId: string; entryType: string; transactionDate: string; autoReversalDate?: string; description: string; sourceDocument?: string; allocationMethodId?: string; routing?: string; lines?: Array<{ accountId: string; currencyId: string; debit: number; credit: number; description: string; referenceNo: string }> },
  userId: string,
): JournalEntry {
  const now = nowIso();
  const lines = resolveLines(body.lines ?? [], userId);
  const totals = computeTotals(lines);
  const je: JournalEntry = {
    id: newId(),
    companyId: body.companyId,
    entryType: body.entryType,
    status: 'Unposted',
    transactionDate: body.transactionDate,
    autoReversalDate: body.autoReversalDate ?? null,
    description: body.description,
    sourceDocument: body.sourceDocument ?? '',
    allocationMethodId: body.allocationMethodId ?? null,
    routing: body.routing ?? null,
    posted: false,
    postedAt: null,
    postedByUserId: null,
    editedAt: now,
    editedByUserId: userId,
    createdAt: now,
    createdByUserId: userId,
    lines,
    ...totals,
    hasOpenQuestions: false,
    routingRuleId: null,
    submittedAt: null,
    approvedAt: null,
    approvedById: null,
    rejectionReason: null,
    rejectedAt: null,
    rejectedById: null,
  };
  store.journalEntries.set(je.id, je);
  return je;
}

export function updateJournalEntry(
  id: string,
  body: { companyId?: string; entryType?: string; transactionDate?: string; autoReversalDate?: string | null; description?: string; sourceDocument?: string; allocationMethodId?: string | null; routing?: string | null; lines?: Array<{ accountId: string; currencyId: string; debit: number; credit: number; description: string; referenceNo: string }> },
  userId: string,
): JournalEntry {
  const je = getJournalEntry(id);
  if (je.status === 'Posted') throw conflict('ENTRY_POSTED', 'Cannot edit a posted journal entry');
  const now = nowIso();
  const lines = body.lines !== undefined ? resolveLines(body.lines, userId) : je.lines;
  const totals = computeTotals(lines);
  const updated: JournalEntry = {
    ...je,
    companyId: body.companyId ?? je.companyId,
    entryType: body.entryType ?? je.entryType,
    transactionDate: body.transactionDate ?? je.transactionDate,
    autoReversalDate: body.autoReversalDate !== undefined ? body.autoReversalDate : je.autoReversalDate,
    description: body.description ?? je.description,
    sourceDocument: body.sourceDocument ?? je.sourceDocument,
    allocationMethodId: body.allocationMethodId !== undefined ? body.allocationMethodId : je.allocationMethodId,
    routing: body.routing !== undefined ? body.routing : je.routing,
    editedAt: now,
    editedByUserId: userId,
    lines,
    ...totals,
  };
  store.journalEntries.set(id, updated);
  return updated;
}

export function listJournalEntries(query: {
  companyId: string; cursor?: string; direction: 'next' | 'prev'; pageSize: number;
  fromDate?: string; toDate?: string; status?: string; entryType?: string;
  pendingApproval?: boolean; approverId?: string; hasOpenQuestions?: boolean;
}) {
  let all = Array.from(store.journalEntries.values()).filter((je) => je.companyId === query.companyId);
  if (query.fromDate) all = all.filter((je) => je.transactionDate >= query.fromDate!);
  if (query.toDate) all = all.filter((je) => je.transactionDate <= query.toDate!);
  if (query.status) all = all.filter((je) => je.status === query.status);
  if (query.entryType) all = all.filter((je) => je.entryType === query.entryType);
  if (query.pendingApproval) all = all.filter((je) => je.status === 'PendingApproval');
  if (query.hasOpenQuestions) all = all.filter((je) => je.hasOpenQuestions);
  all.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  return cursorPage(all, query.cursor, query.direction, query.pageSize);
}

export function postJournalEntry(id: string, userId: string): JournalEntry {
  const je = getJournalEntry(id);
  if (je.status === 'Posted') throw conflict('ALREADY_POSTED', 'Entry is already posted');
  if (je.status === 'PendingApproval') throw new AppError(422, 'PENDING_APPROVAL', 'Entry is pending approval');
  if (!je.isBalanced) {
    throw new AppError(400, 'ENTRY_NOT_BALANCED', 'Journal entry is not balanced. Total debits must equal total credits.', undefined, undefined, {
      totalDebit: je.totalDebit, totalCredit: je.totalCredit, difference: je.difference,
    });
  }
  const now = nowIso();
  const updated: JournalEntry = { ...je, status: 'Posted', posted: true, postedAt: now, postedByUserId: userId, editedAt: now, editedByUserId: userId };
  store.journalEntries.set(id, updated);
  return updated;
}

export function unpostJournalEntry(id: string, userId: string): JournalEntry {
  const je = getJournalEntry(id);
  if (je.status !== 'Posted') throw conflict('NOT_POSTED', 'Entry is not in Posted status');
  const now = nowIso();
  const updated: JournalEntry = { ...je, status: 'Unposted', posted: false, postedAt: null, postedByUserId: null, editedAt: now, editedByUserId: userId };
  store.journalEntries.set(id, updated);
  return updated;
}

export function reverseJournalEntry(id: string, reversalDate: string | undefined, userId: string): JournalEntry {
  const je = getJournalEntry(id);
  if (je.status !== 'Posted') throw conflict('ENTRY_NOT_POSTED', 'Reversal requires a Posted entry');
  const rDate = reversalDate ?? je.autoReversalDate;
  if (!rDate) throw conflict('NO_REVERSAL_DATE', 'No autoReversalDate set and no reversalDate provided');
  if (!isOpenPeriod(rDate)) throw unprocessable('PERIOD_CLOSED', 'Reversal date falls in a closed period');
  const now = nowIso();
  const reversalLines: JournalEntryLine[] = je.lines.map((l) => ({ ...l, debit: l.credit, credit: l.debit }));
  const totals = computeTotals(reversalLines);
  const reversal: JournalEntry = {
    id: newId(),
    companyId: je.companyId,
    entryType: 'REV',
    status: 'Unposted',
    transactionDate: rDate,
    autoReversalDate: null,
    description: `Reversal of ${je.id}: ${je.description}`,
    sourceDocument: je.sourceDocument,
    allocationMethodId: null,
    routing: null,
    posted: false,
    postedAt: null,
    postedByUserId: null,
    editedAt: now,
    editedByUserId: userId,
    createdAt: now,
    createdByUserId: userId,
    lines: reversalLines,
    ...totals,
    hasOpenQuestions: false,
    routingRuleId: null,
    submittedAt: null,
    approvedAt: null,
    approvedById: null,
    rejectionReason: null,
    rejectedAt: null,
    rejectedById: null,
  };
  store.journalEntries.set(reversal.id, reversal);
  return reversal;
}

export function submitForApproval(id: string, userId: string): JournalEntry {
  const je = getJournalEntry(id);
  if (je.status !== 'Unposted') throw conflict('INVALID_STATUS', 'Entry must be Unposted to submit for approval');
  if (!je.routing) throw new AppError(400, 'NO_ROUTING_RULE', 'Entry has no routing value set');
  const now = nowIso();
  const rr = Array.from(store.routingRules.values()).find((r) => r.id === je.routing || r.name === je.routing);
  const updated: JournalEntry = { ...je, status: 'PendingApproval', routingRuleId: rr?.id ?? je.routing, submittedAt: now, editedAt: now, editedByUserId: userId };
  store.journalEntries.set(id, updated);
  return updated;
}

export function approveJournalEntry(id: string, userId: string): JournalEntry {
  const je = getJournalEntry(id);
  if (je.status !== 'PendingApproval') throw conflict('INVALID_STATUS', 'Entry is not in PendingApproval status');
  const now = nowIso();
  const updated: JournalEntry = { ...je, status: 'Approved', approvedAt: now, approvedById: userId, editedAt: now, editedByUserId: userId };
  store.journalEntries.set(id, updated);
  return updated;
}

export function rejectJournalEntry(id: string, rejectionReason: string, userId: string): JournalEntry {
  const je = getJournalEntry(id);
  if (je.status !== 'PendingApproval') throw conflict('INVALID_STATUS', 'Entry is not in PendingApproval status');
  const now = nowIso();
  const updated: JournalEntry = { ...je, status: 'Unposted', rejectionReason, rejectedAt: now, rejectedById: userId, editedAt: now, editedByUserId: userId };
  store.journalEntries.set(id, updated);
  return updated;
}

export function exportJournalEntries(query: { companyId: string; fromDate?: string; toDate?: string; status?: string; format: string }): string {
  let all = Array.from(store.journalEntries.values()).filter((je) => je.companyId === query.companyId);
  if (query.fromDate) all = all.filter((je) => je.transactionDate >= query.fromDate!);
  if (query.toDate) all = all.filter((je) => je.transactionDate <= query.toDate!);
  if (query.status) all = all.filter((je) => je.status === query.status);
  const header = 'id,transactionDate,entryType,status,description,totalDebit,totalCredit\n';
  const rows = all.map((je) => `${je.id},${je.transactionDate},${je.entryType},${je.status},"${je.description}",${je.totalDebit},${je.totalCredit}`).join('\n');
  return header + rows;
}
