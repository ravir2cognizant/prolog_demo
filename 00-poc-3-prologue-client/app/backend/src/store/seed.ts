import { store } from './memoryStore.js';
import { newId, nowIso } from '../util/ids.js';

export function seedStore(): void {
  // ── Companies ─────────────────────────────────────────────────────────
  const companyId = 'comp-001';
  store.companies.set(companyId, { id: companyId, name: 'Fiserv Corp', active: true });
  store.companies.set('comp-002', { id: 'comp-002', name: 'Fiserv EMEA Ltd', active: true });

  // ── Currencies ────────────────────────────────────────────────────────
  store.currencies.set('USD', { code: 'USD', name: 'US Dollar', isBase: true });
  store.currencies.set('EUR', { code: 'EUR', name: 'Euro', isBase: false });
  store.currencies.set('GBP', { code: 'GBP', name: 'British Pound', isBase: false });

  // ── Journal Entry Types ───────────────────────────────────────────────
  store.journalEntryTypes.set('STD', { code: 'STD', name: 'Standard' });
  store.journalEntryTypes.set('ADJ', { code: 'ADJ', name: 'Adjustment' });
  store.journalEntryTypes.set('ACR', { code: 'ACR', name: 'Accrual' });
  store.journalEntryTypes.set('REV', { code: 'REV', name: 'Reversal' });
  store.journalEntryTypes.set('CLO', { code: 'CLO', name: 'Closing' });

  // ── Source Documents ──────────────────────────────────────────────────
  store.sourceDocuments.set('AP', { code: 'AP', name: 'Accounts Payable' });
  store.sourceDocuments.set('AR', { code: 'AR', name: 'Accounts Receivable' });
  store.sourceDocuments.set('PR', { code: 'PR', name: 'Payroll' });
  store.sourceDocuments.set('MAN', { code: 'MAN', name: 'Manual Entry' });

  // ── Allocation Methods ────────────────────────────────────────────────
  const amId = 'alloc-method-001';
  store.allocationMethods.set(amId, { id: amId, name: 'Proportional by Revenue' });
  const amId2 = 'alloc-method-002';
  store.allocationMethods.set(amId2, { id: amId2, name: 'Equal Split' });

  // ── Routing Rules ─────────────────────────────────────────────────────
  const rrId = 'rr-001';
  store.routingRules.set(rrId, { id: rrId, name: 'Finance Manager Approval', description: 'Route to finance manager for amounts > $10,000' });
  const rrId2 = 'rr-002';
  store.routingRules.set(rrId2, { id: rrId2, name: 'Director Approval', description: 'Route to director for amounts > $100,000' });

  // ── Accounts ──────────────────────────────────────────────────────────
  const accounts = [
    { id: 'acct-001', code: '1-001-1000-001-01', description: 'Cash and Cash Equivalents', type: 'asset' as const },
    { id: 'acct-002', code: '1-001-1200-001-01', description: 'Accounts Receivable', type: 'asset' as const },
    { id: 'acct-003', code: '1-001-2000-001-01', description: 'Accounts Payable', type: 'liability' as const },
    { id: 'acct-004', code: '1-001-3000-001-01', description: 'Retained Earnings', type: 'equity' as const },
    { id: 'acct-005', code: '1-001-4000-001-01', description: 'Revenue - Product Sales', type: 'revenue' as const },
    { id: 'acct-006', code: '1-001-5000-001-01', description: 'Cost of Goods Sold', type: 'expense' as const },
    { id: 'acct-007', code: '1-001-6000-001-01', description: 'Salaries and Wages', type: 'expense' as const },
    { id: 'acct-008', code: '1-001-7000-001-01', description: 'Depreciation Expense', type: 'expense' as const },
    { id: 'acct-009', code: '1-394-7005-008-96', description: 'Prepaid Insurance', type: 'asset' as const },
    { id: 'acct-010', code: '1-741-7709-001-01', description: 'Accrued Liabilities', type: 'liability' as const },
  ];
  const now = nowIso();
  for (const a of accounts) {
    store.accounts.set(a.id, {
      ...a,
      companyId,
      active: true,
      createdAt: now,
      createdByUserId: 'seed',
      updatedAt: now,
      updatedByUserId: 'seed',
    });
  }

  // ── Fiscal Year and Periods ────────────────────────────────────────────
  const fyId = 'fy-2026';
  store.fiscalYears.set(fyId, {
    id: fyId,
    companyId,
    name: 'FY2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    periodCount: 12,
    status: 'Open',
    createdAt: now,
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthEnds = ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
  for (let i = 0; i < 12; i++) {
    const mon = String(i + 1).padStart(2, '0');
    const pid = `fy-2026-p${i + 1}`;
    store.periods.set(pid, {
      id: pid,
      fiscalYearId: fyId,
      name: `Period ${i + 1} - ${monthNames[i]} 2026`,
      startDate: `2026-${mon}-01`,
      endDate: `2026-${mon}-${monthEnds[i]}`,
      status: i < 4 ? 'Closed' : 'Open',
      sequence: i + 1,
    });
  }

  // ── Sample Journal Entries ─────────────────────────────────────────────
  const je1Id = 'je-seed-001';
  store.journalEntries.set(je1Id, {
    id: je1Id,
    companyId,
    entryType: 'STD',
    status: 'Posted',
    transactionDate: '2026-05-15',
    autoReversalDate: null,
    description: 'May payroll accrual',
    sourceDocument: 'PR',
    allocationMethodId: null,
    routing: null,
    posted: true,
    postedAt: now,
    postedByUserId: 'seed',
    editedAt: now,
    editedByUserId: 'seed',
    createdAt: now,
    createdByUserId: 'seed',
    lines: [
      { lineNumber: 1, accountId: 'acct-007', accountCode: '1-001-6000-001-01', accountDescription: 'Salaries and Wages', currencyId: 'USD', debit: 50000, credit: 0, description: 'May salaries', referenceNo: 'PR-2026-05' },
      { lineNumber: 2, accountId: 'acct-010', accountCode: '1-741-7709-001-01', accountDescription: 'Accrued Liabilities', currencyId: 'USD', debit: 0, credit: 50000, description: 'May payroll liability', referenceNo: 'PR-2026-05' },
    ],
    totalDebit: 50000,
    totalCredit: 50000,
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

  const je2Id = 'je-seed-002';
  store.journalEntries.set(je2Id, {
    id: je2Id,
    companyId,
    entryType: 'ADJ',
    status: 'Unposted',
    transactionDate: '2026-05-20',
    autoReversalDate: '2026-06-01',
    description: 'Prepaid insurance adjustment',
    sourceDocument: 'MAN',
    allocationMethodId: null,
    routing: null,
    posted: false,
    postedAt: null,
    postedByUserId: null,
    editedAt: now,
    editedByUserId: 'seed',
    createdAt: now,
    createdByUserId: 'seed',
    lines: [
      { lineNumber: 1, accountId: 'acct-009', accountCode: '1-394-7005-008-96', accountDescription: 'Prepaid Insurance', currencyId: 'USD', debit: 1200, credit: 0, description: 'Insurance prepayment', referenceNo: 'INS-2026' },
      { lineNumber: 2, accountId: 'acct-001', accountCode: '1-001-1000-001-01', accountDescription: 'Cash and Cash Equivalents', currencyId: 'USD', debit: 0, credit: 1200, description: 'Cash payment', referenceNo: 'INS-2026' },
    ],
    totalDebit: 1200,
    totalCredit: 1200,
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

  // ── Allocation Rules ──────────────────────────────────────────────────
  const arId = 'ar-seed-001';
  store.allocationRules.set(arId, {
    id: arId,
    companyId,
    name: 'IT Cost Allocation',
    sourceAccountId: 'acct-008',
    sourceAccountCode: '1-001-7000-001-01',
    allocationBasis: 'Percentage',
    targets: [
      { accountId: 'acct-005', value: 60 },
      { accountId: 'acct-006', value: 40 },
    ],
    targetCount: 2,
    createdAt: now,
    updatedAt: now,
  });

  // ── Budgets ───────────────────────────────────────────────────────────
  const budgetKey = `${companyId}:2026`;
  const periods2026 = Array.from({ length: 12 }, (_, i) => `fy-2026-p${i + 1}`);
  store.budgets.set(budgetKey, {
    companyId,
    fiscalYear: 2026,
    rows: [
      {
        accountId: 'acct-005', accountCode: '1-001-4000-001-01', accountDescription: 'Revenue - Product Sales',
        budgets: periods2026.map((pid) => ({ periodId: pid, amount: 500000 })),
      },
      {
        accountId: 'acct-006', accountCode: '1-001-5000-001-01', accountDescription: 'Cost of Goods Sold',
        budgets: periods2026.map((pid) => ({ periodId: pid, amount: 300000 })),
      },
    ],
  });

  // ── Consolidation Sources ─────────────────────────────────────────────
  const csId = 'cs-seed-001';
  store.consolidationSources.set(csId, {
    id: csId,
    name: 'EMEA Database',
    sourceType: 'database',
    status: 'Active',
    connectionConfig: { host: 'emea-db.internal', db: 'prologue' },
    lastRunAt: now,
    createdAt: now,
  });

  // ── Report Designs ────────────────────────────────────────────────────
  const rdId = 'rd-seed-001';
  store.reportDesigns.set(rdId, {
    id: rdId,
    name: 'Income Statement Q2 2026',
    description: 'Standard income statement for Q2 2026',
    rowDefinitions: [
      { label: 'Revenue', accountId: 'acct-005', accountGroupId: null },
      { label: 'COGS', accountId: 'acct-006', accountGroupId: null },
    ],
    columnPeriods: ['fy-2026-p4', 'fy-2026-p5', 'fy-2026-p6'],
    createdAt: now,
    updatedAt: now,
    createdBy: 'seed',
  });

  // ── Accrual Schedule ──────────────────────────────────────────────────
  const asId = newId();
  store.accrualSchedules.set(asId, {
    id: asId,
    companyId,
    description: 'Monthly insurance accrual',
    scheduleType: 'Monthly',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
    baseEntry: { description: 'Insurance accrual', lines: [] },
    reversalOffset: 1,
    entryCount: 5,
    entries: [],
    createdAt: now,
    updatedAt: now,
  });
}
