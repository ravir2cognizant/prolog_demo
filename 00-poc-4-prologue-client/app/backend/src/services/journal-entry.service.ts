import { memoryStore } from '../store/memoryStore.js';
import type {
  JournalEntry,
  JournalEntryFull,
  JournalTotals,
  LineItem,
  NavigationContext,
  Principal,
} from '../domain/types.js';
import type {
  CreateJournalEntryBodyT,
  NavigationQueryT,
  UpdateJournalEntryBodyLenientT,
} from '../domain/schemas.js';
import { badRequest, conflict, forbidden, notFound } from '../util/errors.js';
import { makeCounter } from '../util/ids.js';

function computeTotals(lines: LineItem[]): JournalTotals {
  let totalDebits = 0;
  let totalCredits = 0;
  for (const l of lines) {
    totalDebits += l.debitAmount;
    totalCredits += l.creditAmount;
  }
  // Round to 2dp to avoid float drift in the response.
  totalDebits = Math.round(totalDebits * 100) / 100;
  totalCredits = Math.round(totalCredits * 100) / 100;
  const difference = Math.round((totalDebits - totalCredits) * 100) / 100;
  return { totalDebits, totalCredits, difference };
}

export function linesForJournal(journalId: number): LineItem[] {
  const all = [...memoryStore.get().lineItems.values()]
    .filter((l) => l.journalId === journalId)
    .sort((a, b) => a.lineNumber - b.lineNumber)
    .map((l) => {
      // Strip the internal `journalId` association before returning.
      const { journalId: _omit, ...rest } = l;
      return rest;
    });
  return all;
}

function recalculateBalanced(journalId: number): void {
  const s = memoryStore.get();
  const je = s.journalEntries.get(journalId);
  if (!je) return;
  const totals = computeTotals(linesForJournal(journalId));
  je.balanced = Math.abs(totals.difference) < 1e-9 && (totals.totalDebits + totals.totalCredits) > 0;
}

export function getJournalEntry(journalId: number): JournalEntryFull {
  const s = memoryStore.get();
  const je = s.journalEntries.get(journalId);
  if (!je) throw notFound('Journal entry not found');
  const lines = linesForJournal(journalId);
  const totals = computeTotals(lines);
  return { ...je, lines, totals };
}

export interface CreateJournalEntryResult {
  journalId: number;
  journalNumber: number;
  status: 'Unposted';
  editDateTime: string;
  editUserId: string;
}

export function createJournalEntry(
  body: CreateJournalEntryBodyT,
  principal: Principal,
): CreateJournalEntryResult {
  const s = memoryStore.get();
  if (!s.companies.has(body.companyId)) {
    throw badRequest('Unknown companyId', 'companyId');
  }
  if (!s.journalEntryTypes.has(body.journalEntryType)) {
    throw badRequest('Unknown journalEntryType', 'journalEntryType');
  }
  const journalId = s.nextJournalId();
  const journalNumber = s.nextJournalNumber();
  const editDateTime = new Date().toISOString();
  const company = s.companies.get(body.companyId);
  const entry: JournalEntry = {
    journalId,
    companyId: body.companyId,
    companyName: company?.companyName ?? body.companyId,
    journalEntryType: body.journalEntryType,
    journalNumber,
    status: 'Unposted',
    transactionDate: body.transactionDate,
    editDateTime,
    editUserId: principal.userId,
    autoReversalDate: body.autoReversalDate ?? null,
    description: body.description,
    postingSession: null,
    sourceDocument: null,
    glImport: null,
    allocationMethodId: body.allocationMethodId ?? null,
    balanced: false,
    postedDateTime: null,
    posterUserId: null,
  };
  s.journalEntries.set(journalId, entry);
  s.lineNumberCounters.set(journalId, makeCounter(1));
  return { journalId, journalNumber, status: 'Unposted', editDateTime, editUserId: principal.userId };
}

export interface UpdateJournalEntryResult {
  journalId: number;
  editDateTime: string;
  editUserId: string;
}

export function updateJournalEntry(
  journalId: number,
  body: UpdateJournalEntryBodyLenientT,
  principal: Principal,
): UpdateJournalEntryResult {
  const s = memoryStore.get();
  const je = s.journalEntries.get(journalId);
  if (!je) throw notFound('Journal entry not found');
  if (je.status === 'Posted') throw forbidden();
  // companyId is INTENTIONALLY ignored -- locked post-creation (ED-003).
  if (body.journalEntryType !== undefined) {
    if (!s.journalEntryTypes.has(body.journalEntryType)) {
      throw badRequest('Unknown journalEntryType', 'journalEntryType');
    }
    je.journalEntryType = body.journalEntryType;
  }
  if (body.transactionDate !== undefined) je.transactionDate = body.transactionDate;
  if (body.description !== undefined) je.description = body.description;
  if (body.autoReversalDate !== undefined) je.autoReversalDate = body.autoReversalDate;
  if (body.allocationMethodId !== undefined) je.allocationMethodId = body.allocationMethodId;
  const editDateTime = new Date().toISOString();
  je.editDateTime = editDateTime;
  je.editUserId = principal.userId;
  return { journalId, editDateTime, editUserId: principal.userId };
}

export interface PostJournalEntryResult {
  journalId: number;
  status: 'Posted';
  postedDateTime: string;
  posterUserId: string;
}

export function postJournalEntry(
  journalId: number,
  principal: Principal,
): PostJournalEntryResult {
  const s = memoryStore.get();
  const je = s.journalEntries.get(journalId);
  if (!je) throw notFound('Journal entry not found');
  if (je.status === 'Posted') {
    throw conflict('Journal entry is already posted');
  }
  const totals = computeTotals(linesForJournal(journalId));
  const isBalanced =
    Math.abs(totals.difference) < 1e-9 && (totals.totalDebits + totals.totalCredits) > 0;
  if (!isBalanced) {
    throw badRequest('Journal entry is not balanced');
  }
  const postedDateTime = new Date().toISOString();
  je.status = 'Posted';
  je.postedDateTime = postedDateTime;
  je.posterUserId = principal.userId;
  je.balanced = true;
  return {
    journalId,
    status: 'Posted',
    postedDateTime,
    posterUserId: principal.userId,
  };
}

function compareForSort(
  a: JournalEntry,
  b: JournalEntry,
  field: NavigationQueryT['sortField'],
): number {
  if (field === 'journalNumber') return a.journalNumber - b.journalNumber;
  if (field === 'transactionDate') return a.transactionDate.localeCompare(b.transactionDate);
  return a.editDateTime.localeCompare(b.editDateTime);
}

export function getNavigationContext(
  journalId: number,
  query: NavigationQueryT,
): NavigationContext {
  const s = memoryStore.get();
  const target = s.journalEntries.get(journalId);
  if (!target) throw notFound('Journal entry not found');

  let entries = [...s.journalEntries.values()];
  if (query.companyId) {
    entries = entries.filter((e) => e.companyId === query.companyId);
  }
  entries.sort((a, b) => {
    const cmp = compareForSort(a, b, query.sortField);
    return query.sortOrder === 'asc' ? cmp : -cmp;
  });

  const idx = entries.findIndex((e) => e.journalId === journalId);
  if (idx === -1) {
    // The target is filtered out by companyId scoping; respond as 404 to avoid
    // exposing entries the caller is not permitted to navigate to.
    throw notFound('Journal entry not found');
  }
  const totalCount = entries.length;
  const isFirst = idx === 0;
  const isLast = idx === totalCount - 1;
  return {
    currentJournalId: journalId,
    firstJournalId: totalCount > 0 ? entries[0]!.journalId : null,
    previousJournalId: isFirst ? null : entries[idx - 1]!.journalId,
    nextJournalId: isLast ? null : entries[idx + 1]!.journalId,
    lastJournalId: totalCount > 0 ? entries[totalCount - 1]!.journalId : null,
    isFirst,
    isLast,
    totalCount,
  };
}

export { computeTotals, recalculateBalanced };
