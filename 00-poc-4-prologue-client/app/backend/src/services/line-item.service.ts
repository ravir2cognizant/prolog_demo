import { memoryStore } from '../store/memoryStore.js';
import type { LineItem } from '../domain/types.js';
import type { CreateLineItemBodyT, UpdateLineItemBodyT } from '../domain/schemas.js';
import { badRequest, forbidden, notFound } from '../util/errors.js';
import { isAccountCodeFormatValid } from './account.service.js';
import { linesForJournal, recalculateBalanced } from './journal-entry.service.js';
import { makeCounter } from '../util/ids.js';

function assertJEEditable(journalId: number): void {
  const je = memoryStore.get().journalEntries.get(journalId);
  if (!je) throw notFound('Journal entry not found');
  if (je.status === 'Posted') throw forbidden();
}

function ensureLineCounter(journalId: number): () => number {
  const s = memoryStore.get();
  let counter = s.lineNumberCounters.get(journalId);
  if (!counter) {
    // Recover the next sequential number from the highest existing lineNumber.
    const existing = linesForJournal(journalId);
    const maxNo = existing.length > 0 ? Math.max(...existing.map((l) => l.lineNumber)) : 0;
    counter = makeCounter(maxNo + 1);
    s.lineNumberCounters.set(journalId, counter);
  }
  return counter;
}

export function listLines(journalId: number): LineItem[] {
  const je = memoryStore.get().journalEntries.get(journalId);
  if (!je) throw notFound('Journal entry not found');
  return linesForJournal(journalId);
}

export function createLine(journalId: number, body: CreateLineItemBodyT): LineItem {
  assertJEEditable(journalId);
  const s = memoryStore.get();
  if (!isAccountCodeFormatValid(body.accountCode)) {
    throw badRequest('Invalid account code format', 'accountCode');
  }
  const account = s.accounts.get(body.accountCode);
  // Per ED-004 NFR the account lookup may still succeed for unknown codes if the
  // upstream chartfield system would mint them. Here in the POC we soft-allow
  // creating a line for an unseeded account but populate a blank description.
  const accountDescription = account?.accountDescription ?? '';
  const counter = ensureLineCounter(journalId);
  const lineId = s.nextLineId();
  const lineNumber = counter();
  const line: LineItem & { journalId: number } = {
    journalId,
    lineId,
    lineNumber,
    accountCode: body.accountCode,
    accountDescription,
    currencyId: body.currencyId,
    debitAmount: body.debitAmount ?? 0,
    creditAmount: body.creditAmount ?? 0,
    description: body.description ?? '',
    referenceNumber: body.referenceNumber ?? '',
  };
  s.lineItems.set(lineId, line);
  recalculateBalanced(journalId);
  const { journalId: _omit, ...out } = line;
  return out;
}

export function updateLine(
  journalId: number,
  lineId: number,
  body: UpdateLineItemBodyT,
): LineItem {
  assertJEEditable(journalId);
  const s = memoryStore.get();
  const existing = s.lineItems.get(lineId);
  if (!existing || existing.journalId !== journalId) {
    throw notFound('Line item not found');
  }
  if (body.accountCode !== undefined) {
    if (!isAccountCodeFormatValid(body.accountCode)) {
      throw badRequest('Invalid account code format', 'accountCode');
    }
    existing.accountCode = body.accountCode;
    existing.accountDescription = s.accounts.get(body.accountCode)?.accountDescription ?? '';
  }
  if (body.currencyId !== undefined) existing.currencyId = body.currencyId;
  if (body.debitAmount !== undefined) existing.debitAmount = body.debitAmount;
  if (body.creditAmount !== undefined) existing.creditAmount = body.creditAmount;
  if (body.description !== undefined) existing.description = body.description;
  if (body.referenceNumber !== undefined) existing.referenceNumber = body.referenceNumber;

  // Re-check mutual exclusion after merge -- the Zod refine only sees the incoming body.
  if (existing.debitAmount > 0 && existing.creditAmount > 0) {
    throw badRequest('debitAmount and creditAmount are mutually exclusive', 'debitAmount');
  }
  recalculateBalanced(journalId);
  const { journalId: _omit, ...out } = existing;
  return out;
}

export function deleteLine(journalId: number, lineId: number): void {
  assertJEEditable(journalId);
  const s = memoryStore.get();
  const existing = s.lineItems.get(lineId);
  if (!existing || existing.journalId !== journalId) {
    throw notFound('Line item not found');
  }
  s.lineItems.delete(lineId);
  recalculateBalanced(journalId);
}
