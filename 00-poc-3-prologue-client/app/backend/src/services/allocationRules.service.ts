import { store } from '../store/memoryStore.js';
import type { AllocationRule, AllocationBasis, AllocationTarget } from '../domain/types.js';
import { AppError, notFound, conflict, unprocessable } from '../util/errors.js';
import { newId, nowIso } from '../util/ids.js';

function validatePercentages(basis: AllocationBasis, targets: AllocationTarget[]): void {
  if (basis === 'Percentage') {
    const total = targets.reduce((s, t) => s + t.value, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new AppError(400, 'PERCENTAGES_NOT_100', `Percentage targets sum to ${total.toFixed(2)}, must equal 100`, undefined, undefined, { computedTotal: total });
    }
  }
}

export function listAllocationRules(query: { companyId?: string }): AllocationRule[] {
  let all = Array.from(store.allocationRules.values());
  if (query.companyId) all = all.filter((r) => r.companyId === query.companyId);
  return all;
}

export function createAllocationRule(
  body: { companyId: string; name: string; sourceAccountId: string; allocationBasis: AllocationBasis; targets: AllocationTarget[] },
  _userId: string,
): AllocationRule {
  validatePercentages(body.allocationBasis, body.targets);
  const srcAcct = store.accounts.get(body.sourceAccountId);
  const now = nowIso();
  const id = newId();
  const rule: AllocationRule = {
    id,
    companyId: body.companyId,
    name: body.name,
    sourceAccountId: body.sourceAccountId,
    sourceAccountCode: srcAcct?.code ?? '',
    allocationBasis: body.allocationBasis,
    targets: body.targets,
    targetCount: body.targets.length,
    createdAt: now,
    updatedAt: now,
  };
  store.allocationRules.set(id, rule);
  return rule;
}

export function updateAllocationRule(
  id: string,
  body: { name?: string; sourceAccountId?: string; allocationBasis?: AllocationBasis; targets?: AllocationTarget[] },
  _userId: string,
): AllocationRule {
  const r = store.allocationRules.get(id);
  if (!r) throw notFound(`Allocation rule ${id} not found`);
  const basis = body.allocationBasis ?? r.allocationBasis;
  const targets = body.targets ?? r.targets;
  validatePercentages(basis, targets);
  const srcAcct = body.sourceAccountId ? store.accounts.get(body.sourceAccountId) : undefined;
  const now = nowIso();
  const updated: AllocationRule = {
    ...r,
    name: body.name ?? r.name,
    sourceAccountId: body.sourceAccountId ?? r.sourceAccountId,
    sourceAccountCode: srcAcct?.code ?? r.sourceAccountCode,
    allocationBasis: basis,
    targets,
    targetCount: targets.length,
    updatedAt: now,
  };
  store.allocationRules.set(id, updated);
  return updated;
}

export function deleteAllocationRule(id: string): { id: string; deletedAt: string } {
  if (!store.allocationRules.has(id)) throw notFound(`Allocation rule ${id} not found`);
  const inUse = Array.from(store.journalEntries.values()).some((je) => je.allocationMethodId === id);
  if (inUse) throw conflict('RULE_IN_USE', 'Rule is referenced by one or more journal entries');
  const deletedAt = nowIso();
  store.allocationRules.delete(id);
  return { id, deletedAt };
}

export function runAllocationRule(id: string, body: { fiscalYearId: string; periodId: string }, userId: string) {
  const rule = store.allocationRules.get(id);
  if (!rule) throw notFound(`Allocation rule ${id} not found`);
  if (!store.fiscalYears.has(body.fiscalYearId)) throw notFound(`Fiscal year ${body.fiscalYearId} not found`);
  const period = store.periods.get(body.periodId);
  if (!period || period.fiscalYearId !== body.fiscalYearId) throw notFound(`Period ${body.periodId} not found`);
  if (period.status === 'Closed') throw unprocessable('PERIOD_CLOSED', 'Specified period is closed');

  const srcBalances = Array.from(store.journalEntries.values())
    .filter((je) => je.status === 'Posted' && je.transactionDate >= period.startDate && je.transactionDate <= period.endDate)
    .flatMap((je) => je.lines.filter((l) => l.accountId === rule.sourceAccountId));
  const sourceBalance = srcBalances.reduce((s, l) => s + l.debit - l.credit, 0);

  const allocationRunId = newId();
  const generatedEntryIds: string[] = [];
  const now = nowIso();

  for (const target of rule.targets) {
    const amount = rule.allocationBasis === 'Percentage'
      ? (sourceBalance * target.value) / 100
      : target.value;
    const targetAcct = store.accounts.get(target.accountId);
    const srcAcct = store.accounts.get(rule.sourceAccountId);
    const jeId = newId();
    store.journalEntries.set(jeId, {
      id: jeId,
      companyId: rule.companyId,
      entryType: 'ADJ',
      status: 'Unposted',
      transactionDate: period.startDate,
      autoReversalDate: null,
      description: `Allocation run: ${rule.name}`,
      sourceDocument: '',
      allocationMethodId: id,
      routing: null,
      posted: false,
      postedAt: null,
      postedByUserId: null,
      editedAt: now,
      editedByUserId: userId,
      createdAt: now,
      createdByUserId: userId,
      lines: [
        { lineNumber: 1, accountId: rule.sourceAccountId, accountCode: srcAcct?.code ?? '', accountDescription: srcAcct?.description ?? '', currencyId: 'USD', debit: 0, credit: Math.abs(amount), description: '', referenceNo: '' },
        { lineNumber: 2, accountId: target.accountId, accountCode: targetAcct?.code ?? '', accountDescription: targetAcct?.description ?? '', currencyId: 'USD', debit: Math.abs(amount), credit: 0, description: '', referenceNo: '' },
      ],
      totalDebit: Math.abs(amount),
      totalCredit: Math.abs(amount),
      difference: 0,
      isBalanced: true,
      hasOpenQuestions: false,
      routingRuleId: null,
      submittedAt: null,
      approvedAt: null,
      approvedById: null,
      rejectionReason: null,
      rejectedAt: null,
      rejectedById: null,
    });
    generatedEntryIds.push(jeId);
  }

  return { allocationRunId, generatedEntryIds, entryCount: generatedEntryIds.length, sourceBalance };
}
