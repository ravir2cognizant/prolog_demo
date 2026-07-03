import type {
  Account,
  Company,
  JournalEntry,
  JournalEntryType,
  LineItem,
  NavItem,
} from '../domain/types.js';
import type {
  CreateJournalEntryBodyT,
  CreateLineItemBodyT,
  UpdateJournalEntryBodyLenientT,
  UpdateLineItemBodyT,
} from '../domain/schemas.js';
import { memoryStore } from './memoryStore.js';
import { makeCounter } from '../util/ids.js';

/**
 * Seed fixtures for the in-memory store and request-payload factories that
 * A-08 (BFF tests) imports for valid request building.
 *
 * Calling seedStore() is idempotent against a fresh `memoryStore.reset()` and
 * deterministic: identical inputs => identical journalIds, lineIds, ordering.
 */

export const SEED_USER_ID = 'usr-001';
export const SEED_USER_DISPLAY_NAME = 'Demo Accountant';

const ACCOUNTS: Account[] = [
  {
    accountCode: 'US-01-1000-100-01',
    accountDescription: 'Cash - Operating',
    isValid: true,
    segment1: 'US',
    segment2: '01',
    segment3: '1000',
    segment4: '100',
    segment5: '01',
  },
  {
    accountCode: 'US-01-2000-100-01',
    accountDescription: 'Accounts Payable',
    isValid: true,
    segment1: 'US',
    segment2: '01',
    segment3: '2000',
    segment4: '100',
    segment5: '01',
  },
  {
    accountCode: 'US-01-4000-100-01',
    accountDescription: 'Revenue - Product',
    isValid: true,
    segment1: 'US',
    segment2: '01',
    segment3: '4000',
    segment4: '100',
    segment5: '01',
  },
  {
    accountCode: 'US-01-5000-100-01',
    accountDescription: 'Cost of Goods Sold',
    isValid: true,
    segment1: 'US',
    segment2: '01',
    segment3: '5000',
    segment4: '100',
    segment5: '01',
  },
  {
    accountCode: 'US-01-6000-200-02',
    accountDescription: 'Office Supplies',
    isValid: true,
    segment1: 'US',
    segment2: '01',
    segment3: '6000',
    segment4: '200',
    segment5: '02',
  },
  {
    accountCode: 'US-02-1000-100-01',
    accountDescription: 'Cash - Inactive Subsidiary',
    isValid: false,
    segment1: 'US',
    segment2: '02',
    segment3: '1000',
    segment4: '100',
    segment5: '01',
  },
];

const COMPANIES: Company[] = [
  { companyId: '0004', companyName: '0004_company', displayLabel: '0004 - 0004_company' },
  { companyId: '0005', companyName: 'Alpha Corp', displayLabel: '0005 - Alpha Corp' },
  { companyId: '0006', companyName: 'Beta Holdings', displayLabel: '0006 - Beta Holdings' },
];

const JE_TYPES: JournalEntryType[] = [
  { typeCode: 'FJ', typeLabel: 'Finance Journal' },
  { typeCode: 'AJ', typeLabel: 'Accrual Journal' },
  { typeCode: 'RJ', typeLabel: 'Reversal Journal' },
];

const NAV_ITEMS: NavItem[] = [
  {
    id: 'gl',
    label: 'General Ledger',
    route: '/gl',
    level: 0,
    parentId: null,
    alertState: false,
    enabled: true,
  },
  {
    id: 'gl-journal-entries',
    label: 'Journal Entries',
    route: '/gl/journal-entries',
    level: 1,
    parentId: 'gl',
    alertState: false,
    enabled: true,
  },
  {
    id: 'gl-reports',
    label: 'GL Reports',
    route: '/gl/reports',
    level: 1,
    parentId: 'gl',
    alertState: true,
    enabled: true,
  },
  {
    id: 'gl-trial-balance',
    label: 'Trial Balance',
    route: '/gl/trial-balance',
    level: 1,
    parentId: 'gl',
    alertState: false,
    enabled: false,
  },
  {
    id: 'ap',
    label: 'Accounts Payable',
    route: '/ap',
    level: 0,
    parentId: null,
    alertState: false,
    enabled: true,
  },
];

interface JournalEntrySeed {
  companyId: string;
  journalEntryType: string;
  status: 'Unposted' | 'Posted';
  transactionDate: string;
  description: string;
  postedAt?: string | null;
  lines: Array<{
    accountCode: string;
    currencyId: string;
    debitAmount: number;
    creditAmount: number;
    description?: string;
    referenceNumber?: string;
  }>;
}

const JE_SEEDS: JournalEntrySeed[] = [
  // journalId 1 -- Unposted + balanced (TC-BFF-011, TC-BFF-019, TC-BFF-025 fixtures)
  {
    companyId: '0004',
    journalEntryType: 'FJ',
    status: 'Unposted',
    transactionDate: '2026-05-20',
    description: 'May payroll accrual',
    lines: [
      {
        accountCode: 'US-01-5000-100-01',
        currencyId: 'USD',
        debitAmount: 500,
        creditAmount: 0,
        description: 'Salary expense',
        referenceNumber: 'PR-001',
      },
      {
        accountCode: 'US-01-2000-100-01',
        currencyId: 'USD',
        debitAmount: 0,
        creditAmount: 500,
        description: 'Payable',
        referenceNumber: 'PR-001',
      },
    ],
  },
  // journalId 2 -- Posted (TC-BFF-012, TC-BFF-027, TC-BFF-035 fixtures)
  {
    companyId: '0005',
    journalEntryType: 'AJ',
    status: 'Posted',
    transactionDate: '2026-05-10',
    description: 'Q1 revenue accrual',
    postedAt: '2026-05-11T09:30:00.000Z',
    lines: [
      {
        accountCode: 'US-01-1000-100-01',
        currencyId: 'USD',
        debitAmount: 2500,
        creditAmount: 0,
        description: 'Cash received',
        referenceNumber: 'AR-101',
      },
      {
        accountCode: 'US-01-4000-100-01',
        currencyId: 'USD',
        debitAmount: 0,
        creditAmount: 2500,
        description: 'Revenue',
        referenceNumber: 'AR-101',
      },
    ],
  },
  // journalId 3 -- Unposted + unbalanced (TC-BFF-026)
  {
    companyId: '0004',
    journalEntryType: 'FJ',
    status: 'Unposted',
    transactionDate: '2026-05-21',
    description: 'Draft adjustment',
    lines: [
      {
        accountCode: 'US-01-6000-200-02',
        currencyId: 'USD',
        debitAmount: 500,
        creditAmount: 0,
        description: 'Office supplies',
        referenceNumber: 'ADJ-001',
      },
    ],
  },
  // journalId 4 -- Unposted, no lines yet
  {
    companyId: '0006',
    journalEntryType: 'FJ',
    status: 'Unposted',
    transactionDate: '2026-05-22',
    description: 'Empty draft for product launch',
    lines: [],
  },
  // journalId 5 -- Unposted, single 500 debit (TC-BFF-023 starts here)
  {
    companyId: '0004',
    journalEntryType: 'FJ',
    status: 'Unposted',
    transactionDate: '2026-05-22',
    description: 'Single-line draft - awaiting offset',
    lines: [
      {
        accountCode: 'US-01-5000-100-01',
        currencyId: 'USD',
        debitAmount: 500,
        creditAmount: 0,
        description: 'Initial debit',
        referenceNumber: 'SD-005',
      },
    ],
  },
  // journalId 6 -- Unposted, balanced via two lines (TC-BFF-024 deletes one)
  {
    companyId: '0005',
    journalEntryType: 'AJ',
    status: 'Unposted',
    transactionDate: '2026-05-19',
    description: 'Two-line balanced draft',
    lines: [
      {
        accountCode: 'US-01-5000-100-01',
        currencyId: 'USD',
        debitAmount: 300,
        creditAmount: 0,
        description: 'Debit half',
        referenceNumber: 'BD-006',
      },
      {
        accountCode: 'US-01-2000-100-01',
        currencyId: 'USD',
        debitAmount: 0,
        creditAmount: 300,
        description: 'Credit half',
        referenceNumber: 'BD-006',
      },
    ],
  },
  // journalId 7-9 -- additional history for navigation cases
  {
    companyId: '0004',
    journalEntryType: 'FJ',
    status: 'Posted',
    transactionDate: '2026-04-30',
    description: 'April close - rent',
    postedAt: '2026-05-01T08:00:00.000Z',
    lines: [
      {
        accountCode: 'US-01-6000-200-02',
        currencyId: 'USD',
        debitAmount: 1200,
        creditAmount: 0,
        description: 'Rent',
        referenceNumber: 'CL-04',
      },
      {
        accountCode: 'US-01-1000-100-01',
        currencyId: 'USD',
        debitAmount: 0,
        creditAmount: 1200,
        description: 'Cash out',
        referenceNumber: 'CL-04',
      },
    ],
  },
  // journalId 8 -- balanced unposted, second 0004 entry for nav demos
  {
    companyId: '0004',
    journalEntryType: 'AJ',
    status: 'Unposted',
    transactionDate: '2026-05-15',
    description: 'Mid-month accrual draft',
    lines: [
      {
        accountCode: 'US-01-5000-100-01',
        currencyId: 'USD',
        debitAmount: 100,
        creditAmount: 0,
        description: 'Expense',
        referenceNumber: 'MM-008',
      },
      {
        accountCode: 'US-01-2000-100-01',
        currencyId: 'USD',
        debitAmount: 0,
        creditAmount: 100,
        description: 'Liability',
        referenceNumber: 'MM-008',
      },
    ],
  },
  // journalId 9 -- empty placeholder; not seeded but referenced as gap
  // journalId 10 -- Unposted with no lines (TC-BFF-022 appends sequentially)
  {
    companyId: '0006',
    journalEntryType: 'FJ',
    status: 'Unposted',
    transactionDate: '2026-05-23',
    description: 'Fresh draft for line-number test',
    lines: [],
  },
];

export function seedStore(): void {
  const s = memoryStore.get();
  s.companies.clear();
  s.journalEntryTypes.clear();
  s.accounts.clear();
  s.navItems.length = 0;
  s.journalEntries.clear();
  s.lineItems.clear();
  s.lineNumberCounters.clear();
  // Reset counters to deterministic starting points
  s.nextJournalId = makeCounter(1);
  s.nextJournalNumber = makeCounter(1001);
  s.nextLineId = makeCounter(1);

  for (const c of COMPANIES) s.companies.set(c.companyId, c);
  for (const t of JE_TYPES) s.journalEntryTypes.set(t.typeCode, t);
  for (const a of ACCOUNTS) s.accounts.set(a.accountCode, a);
  s.navItems.push(...NAV_ITEMS);

  // Allocate journalIds 1..N in seed declaration order. journalId 10 is the
  // 9th entry in JE_SEEDS but we want it to be journalId=10 (TC-BFF-022 fixture).
  // We burn journalId 9 so the 9th seed lands on journalId=10.
  JE_SEEDS.forEach((seed, idx) => {
    let journalId: number;
    if (idx <= 7) {
      journalId = s.nextJournalId();
    } else {
      // Burn ID 9, then take 10.
      s.nextJournalId();
      journalId = s.nextJournalId();
    }

    const companyName = s.companies.get(seed.companyId)?.companyName ?? seed.companyId;
    const editDateTime = '2026-05-22T12:00:00.000Z';
    const je: JournalEntry = {
      journalId,
      companyId: seed.companyId,
      companyName,
      journalEntryType: seed.journalEntryType,
      journalNumber: s.nextJournalNumber(),
      status: seed.status,
      transactionDate: seed.transactionDate,
      editDateTime,
      editUserId: SEED_USER_ID,
      autoReversalDate: null,
      description: seed.description,
      postingSession: null,
      sourceDocument: null,
      glImport: null,
      allocationMethodId: null,
      balanced: false, // recalculated below
      postedDateTime: seed.status === 'Posted' ? seed.postedAt ?? '2026-05-11T09:30:00.000Z' : null,
      posterUserId: seed.status === 'Posted' ? SEED_USER_ID : null,
    };
    s.journalEntries.set(journalId, je);

    const lineCounter = makeCounter(1);
    s.lineNumberCounters.set(journalId, lineCounter);
    let dr = 0;
    let cr = 0;
    for (const ln of seed.lines) {
      const lineId = s.nextLineId();
      const lineNumber = lineCounter();
      const account = s.accounts.get(ln.accountCode);
      const line: LineItem & { journalId: number } = {
        journalId,
        lineId,
        lineNumber,
        accountCode: ln.accountCode,
        accountDescription: account?.accountDescription ?? '',
        currencyId: ln.currencyId,
        debitAmount: ln.debitAmount,
        creditAmount: ln.creditAmount,
        description: ln.description ?? '',
        referenceNumber: ln.referenceNumber ?? '',
      };
      s.lineItems.set(lineId, line);
      dr += ln.debitAmount;
      cr += ln.creditAmount;
    }
    je.balanced = Math.abs(dr - cr) < 1e-9 && (dr + cr) > 0;
  });
}

// ---------------------------------------------------------------------------
// Factory functions -- imported by A-08 BFF tests for valid request building.
// One factory per Zod request schema.
// ---------------------------------------------------------------------------

export const validJournalEntryPayload = (
  overrides: Partial<CreateJournalEntryBodyT> = {},
): CreateJournalEntryBodyT => ({
  companyId: '0004',
  journalEntryType: 'FJ',
  transactionDate: '2026-05-23',
  description: 'Seed factory journal entry',
  ...overrides,
});

export const validUpdateJournalEntryPayload = (
  overrides: Partial<UpdateJournalEntryBodyLenientT> = {},
): UpdateJournalEntryBodyLenientT => ({
  description: 'Seed factory update',
  ...overrides,
});

export const validLineItemPayload = (
  overrides: Partial<CreateLineItemBodyT> = {},
): CreateLineItemBodyT => ({
  accountCode: 'US-01-1000-100-01',
  currencyId: 'USD',
  debitAmount: 100,
  ...overrides,
} as CreateLineItemBodyT);

export const validUpdateLineItemPayload = (
  overrides: Partial<UpdateLineItemBodyT> = {},
): UpdateLineItemBodyT => ({
  description: 'Seed factory line update',
  ...overrides,
});

export const validAccountCode = (): string => 'US-01-1000-100-01';

export const validNavigationQuery = (): { sortField: string; sortOrder: string } => ({
  sortField: 'journalNumber',
  sortOrder: 'asc',
});
