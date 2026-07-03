/**
 * MSW handlers - cover every BFF endpoint the SPA calls so that
 * VITE_USE_MSW=1 (the dev default) boots fully offline.
 *
 * Data shapes mirror app/backend/src/store/seed.ts.
 */
import { http, HttpResponse, delay } from 'msw';
import type {
  Account,
  Company,
  CreateJournalEntryRequest,
  CreateLineItemRequest,
  JournalEntry,
  JournalEntryFull,
  JournalEntryType,
  LineItem,
  NavItem,
  NavigationContext,
  UpdateJournalEntryRequest,
  UpdateLineItemRequest,
} from './types';

const baseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:4000';

// --------------------------------------------------------------------------
// In-memory mock store
// --------------------------------------------------------------------------

const accounts: Account[] = [
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
];

const companies: Company[] = [
  { companyId: '0004', companyName: '0004_company', displayLabel: '0004 - 0004_company' },
  { companyId: '0005', companyName: 'Alpha Corp', displayLabel: '0005 - Alpha Corp' },
  { companyId: '0006', companyName: 'Beta Holdings', displayLabel: '0006 - Beta Holdings' },
];

const journalEntryTypes: JournalEntryType[] = [
  { typeCode: 'FJ', typeLabel: 'Finance Journal' },
  { typeCode: 'AJ', typeLabel: 'Accrual Journal' },
  { typeCode: 'RJ', typeLabel: 'Reversal Journal' },
];

const navItems: NavItem[] = [
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

const journalEntries = new Map<number, JournalEntry>();
const lineItemsByJournal = new Map<number, LineItem[]>();

let nextJournalId = 1;
let nextJournalNumber = 1001;
let nextLineId = 1;

function nextId(): number {
  return nextJournalId++;
}
function nextJN(): number {
  return nextJournalNumber++;
}
function nextLI(): number {
  return nextLineId++;
}

function recalcTotals(journalId: number): { totals: { totalDebits: number; totalCredits: number; difference: number }; balanced: boolean } {
  const lines = lineItemsByJournal.get(journalId) ?? [];
  const totalDebits = lines.reduce((s, l) => s + (l.debitAmount ?? 0), 0);
  const totalCredits = lines.reduce((s, l) => s + (l.creditAmount ?? 0), 0);
  const difference = totalDebits - totalCredits;
  const balanced = Math.abs(difference) < 1e-9 && (totalDebits + totalCredits) > 0;
  return { totals: { totalDebits, totalCredits, difference }, balanced };
}

function seedJournalEntry(
  data: Omit<JournalEntry, 'journalId' | 'journalNumber' | 'balanced'>,
  lines: Array<Omit<LineItem, 'lineId' | 'lineNumber'>>,
): void {
  const id = nextId();
  const jn = nextJN();
  const je: JournalEntry = { ...data, journalId: id, journalNumber: jn, balanced: false };
  journalEntries.set(id, je);
  const ll: LineItem[] = lines.map((ln, idx) => ({
    ...ln,
    lineId: nextLI(),
    lineNumber: idx + 1,
  }));
  lineItemsByJournal.set(id, ll);
  const { balanced } = recalcTotals(id);
  je.balanced = balanced;
}

// Seed three entries roughly matching the BFF seed (one Unposted+balanced,
// one Posted, one Unposted+unbalanced) - enough to exercise CI-007 navigation.
seedJournalEntry(
  {
    companyId: '0004',
    companyName: '0004_company',
    journalEntryType: 'FJ',
    status: 'Unposted',
    transactionDate: '2026-05-20',
    editDateTime: '2026-05-22T12:00:00.000Z',
    editUserId: 'usr-001',
    autoReversalDate: null,
    description: 'May payroll accrual',
    postingSession: null,
    sourceDocument: null,
    glImport: null,
    allocationMethodId: null,
    postedDateTime: null,
    posterUserId: null,
  },
  [
    {
      accountCode: 'US-01-5000-100-01',
      accountDescription: 'Cost of Goods Sold',
      currencyId: 'USD',
      debitAmount: 500,
      creditAmount: 0,
      description: 'Salary expense',
      referenceNumber: 'PR-001',
    },
    {
      accountCode: 'US-01-2000-100-01',
      accountDescription: 'Accounts Payable',
      currencyId: 'USD',
      debitAmount: 0,
      creditAmount: 500,
      description: 'Payable',
      referenceNumber: 'PR-001',
    },
  ],
);

seedJournalEntry(
  {
    companyId: '0005',
    companyName: 'Alpha Corp',
    journalEntryType: 'AJ',
    status: 'Posted',
    transactionDate: '2026-05-10',
    editDateTime: '2026-05-22T12:00:00.000Z',
    editUserId: 'usr-001',
    autoReversalDate: null,
    description: 'Q1 revenue accrual',
    postingSession: null,
    sourceDocument: null,
    glImport: null,
    allocationMethodId: null,
    postedDateTime: '2026-05-11T09:30:00.000Z',
    posterUserId: 'usr-001',
  },
  [
    {
      accountCode: 'US-01-1000-100-01',
      accountDescription: 'Cash - Operating',
      currencyId: 'USD',
      debitAmount: 2500,
      creditAmount: 0,
      description: 'Cash received',
      referenceNumber: 'AR-101',
    },
    {
      accountCode: 'US-01-4000-100-01',
      accountDescription: 'Revenue - Product',
      currencyId: 'USD',
      debitAmount: 0,
      creditAmount: 2500,
      description: 'Revenue',
      referenceNumber: 'AR-101',
    },
  ],
);

seedJournalEntry(
  {
    companyId: '0004',
    companyName: '0004_company',
    journalEntryType: 'FJ',
    status: 'Unposted',
    transactionDate: '2026-05-21',
    editDateTime: '2026-05-22T12:00:00.000Z',
    editUserId: 'usr-001',
    autoReversalDate: null,
    description: 'Draft adjustment',
    postingSession: null,
    sourceDocument: null,
    glImport: null,
    allocationMethodId: null,
    postedDateTime: null,
    posterUserId: null,
  },
  [
    {
      accountCode: 'US-01-6000-200-02',
      accountDescription: 'Office Supplies',
      currencyId: 'USD',
      debitAmount: 500,
      creditAmount: 0,
      description: 'Office supplies',
      referenceNumber: 'ADJ-001',
    },
  ],
);

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function buildFullJE(journalId: number): JournalEntryFull | null {
  const je = journalEntries.get(journalId);
  if (!je) return null;
  const lines = lineItemsByJournal.get(journalId) ?? [];
  const { totals, balanced } = recalcTotals(journalId);
  je.balanced = balanced;
  return { ...je, lines, totals };
}

function notFound(message: string) {
  return HttpResponse.json({ error: message }, { status: 404 });
}

// --------------------------------------------------------------------------
// Handlers
// --------------------------------------------------------------------------

export const handlers = [
  // --- ED-001 Navigation ---------------------------------------------------
  http.get(`${baseUrl}/navigation/menu`, () =>
    HttpResponse.json({ items: navItems }),
  ),

  // --- ED-003 / ED-008 Reference data --------------------------------------
  http.get(`${baseUrl}/reference/companies`, async () => {
    await delay(50);
    return HttpResponse.json({ companies });
  }),
  http.get(`${baseUrl}/reference/journal-entry-types`, async () => {
    await delay(50);
    return HttpResponse.json({ types: journalEntryTypes });
  }),

  // --- ED-004 Account lookup -----------------------------------------------
  http.get(`${baseUrl}/accounts/:accountCode`, async ({ params }) => {
    await delay(100);
    const code = params.accountCode as string;
    const acct = accounts.find((a) => a.accountCode === code);
    if (!acct) return notFound('Account not found');
    return HttpResponse.json(acct);
  }),

  // --- ED-002 Get full JE --------------------------------------------------
  http.get(`${baseUrl}/journal-entries/:journalId`, ({ params }) => {
    const journalId = Number(params.journalId);
    const full = buildFullJE(journalId);
    if (!full) return notFound('Journal entry not found');
    return HttpResponse.json(full);
  }),

  // --- ED-007 Navigation context (must precede /:journalId/lines etc) ------
  http.get(
    `${baseUrl}/journal-entries/:journalId/navigation`,
    ({ params, request }) => {
      const journalId = Number(params.journalId);
      const url = new URL(request.url);
      const companyId = url.searchParams.get('companyId') ?? null;
      const sortField =
        url.searchParams.get('sortField') ?? 'journalNumber';
      const sortOrder = url.searchParams.get('sortOrder') ?? 'asc';

      let all = Array.from(journalEntries.values());
      if (companyId) all = all.filter((je) => je.companyId === companyId);

      all.sort((a, b) => {
        const aKey =
          sortField === 'transactionDate'
            ? a.transactionDate
            : sortField === 'editDateTime'
              ? a.editDateTime
              : a.journalNumber;
        const bKey =
          sortField === 'transactionDate'
            ? b.transactionDate
            : sortField === 'editDateTime'
              ? b.editDateTime
              : b.journalNumber;
        if (aKey < bKey) return sortOrder === 'desc' ? 1 : -1;
        if (aKey > bKey) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      });

      const idx = all.findIndex((je) => je.journalId === journalId);
      if (idx === -1) return notFound('Journal entry not found');

      const first = all[0] ?? null;
      const last = all[all.length - 1] ?? null;
      const prev = idx > 0 ? all[idx - 1] : null;
      const next = idx < all.length - 1 ? all[idx + 1] : null;

      const ctx: NavigationContext = {
        currentJournalId: journalId,
        firstJournalId: first ? first.journalId : null,
        previousJournalId: prev ? prev.journalId : null,
        nextJournalId: next ? next.journalId : null,
        lastJournalId: last ? last.journalId : null,
        isFirst: idx === 0,
        isLast: idx === all.length - 1,
        totalCount: all.length,
      };
      return HttpResponse.json(ctx);
    },
  ),

  // --- ED-004 Lines --------------------------------------------------------
  http.get(`${baseUrl}/journal-entries/:journalId/lines`, ({ params }) => {
    const journalId = Number(params.journalId);
    if (!journalEntries.has(journalId))
      return notFound('Journal entry not found');
    return HttpResponse.json({
      journalId,
      lines: lineItemsByJournal.get(journalId) ?? [],
    });
  }),

  http.post(
    `${baseUrl}/journal-entries/:journalId/lines`,
    async ({ params, request }) => {
      const journalId = Number(params.journalId);
      const je = journalEntries.get(journalId);
      if (!je) return notFound('Journal entry not found');
      const body = (await request.json()) as CreateLineItemRequest;
      const acct = accounts.find((a) => a.accountCode === body.accountCode);
      const lines = lineItemsByJournal.get(journalId) ?? [];
      const newLine: LineItem = {
        lineId: nextLI(),
        lineNumber: lines.length + 1,
        accountCode: body.accountCode,
        accountDescription: acct?.accountDescription ?? '',
        currencyId: body.currencyId,
        debitAmount: body.debitAmount ?? 0,
        creditAmount: body.creditAmount ?? 0,
        description: body.description ?? '',
        referenceNumber: body.referenceNumber ?? '',
      };
      lineItemsByJournal.set(journalId, [...lines, newLine]);
      const { balanced } = recalcTotals(journalId);
      je.balanced = balanced;
      return HttpResponse.json(newLine, { status: 201 });
    },
  ),

  http.put(
    `${baseUrl}/journal-entries/:journalId/lines/:lineId`,
    async ({ params, request }) => {
      const journalId = Number(params.journalId);
      const lineId = Number(params.lineId);
      const lines = lineItemsByJournal.get(journalId);
      if (!lines) return notFound('Journal entry not found');
      const idx = lines.findIndex((l) => l.lineId === lineId);
      if (idx === -1) return notFound('Line item not found');
      const body = (await request.json()) as UpdateLineItemRequest;
      const updated: LineItem = { ...lines[idx], ...body };
      if (body.accountCode) {
        const acct = accounts.find((a) => a.accountCode === body.accountCode);
        updated.accountDescription = acct?.accountDescription ?? '';
      }
      lines[idx] = updated;
      const { balanced } = recalcTotals(journalId);
      const je = journalEntries.get(journalId);
      if (je) je.balanced = balanced;
      return HttpResponse.json(updated);
    },
  ),

  http.delete(
    `${baseUrl}/journal-entries/:journalId/lines/:lineId`,
    ({ params }) => {
      const journalId = Number(params.journalId);
      const lineId = Number(params.lineId);
      const lines = lineItemsByJournal.get(journalId);
      if (!lines) return notFound('Journal entry not found');
      const newLines = lines.filter((l) => l.lineId !== lineId);
      lineItemsByJournal.set(journalId, newLines);
      const { balanced } = recalcTotals(journalId);
      const je = journalEntries.get(journalId);
      if (je) je.balanced = balanced;
      return new HttpResponse(null, { status: 204 });
    },
  ),

  // --- ED-003 Create/Update JE ---------------------------------------------
  http.post(`${baseUrl}/journal-entries`, async ({ request }) => {
    const body = (await request.json()) as CreateJournalEntryRequest;
    const id = nextId();
    const jn = nextJN();
    const company = companies.find((c) => c.companyId === body.companyId);
    const je: JournalEntry = {
      journalId: id,
      companyId: body.companyId,
      companyName: company?.companyName ?? body.companyId,
      journalEntryType: body.journalEntryType,
      journalNumber: jn,
      status: 'Unposted',
      transactionDate: body.transactionDate,
      editDateTime: new Date().toISOString(),
      editUserId: 'usr-001',
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
    journalEntries.set(id, je);
    lineItemsByJournal.set(id, []);
    return HttpResponse.json(
      {
        journalId: id,
        journalNumber: jn,
        status: 'Unposted',
        editDateTime: je.editDateTime,
        editUserId: je.editUserId,
      },
      { status: 201 },
    );
  }),

  http.put(
    `${baseUrl}/journal-entries/:journalId`,
    async ({ params, request }) => {
      const journalId = Number(params.journalId);
      const je = journalEntries.get(journalId);
      if (!je) return notFound('Journal entry not found');
      const body = (await request.json()) as UpdateJournalEntryRequest;
      if (body.journalEntryType !== undefined)
        je.journalEntryType = body.journalEntryType;
      if (body.transactionDate !== undefined)
        je.transactionDate = body.transactionDate;
      if (body.description !== undefined) je.description = body.description;
      if (body.autoReversalDate !== undefined)
        je.autoReversalDate = body.autoReversalDate;
      if (body.allocationMethodId !== undefined)
        je.allocationMethodId = body.allocationMethodId;
      je.editDateTime = new Date().toISOString();
      return HttpResponse.json({
        journalId,
        editDateTime: je.editDateTime,
        editUserId: je.editUserId,
      });
    },
  ),

  // --- ED-006 Post JE ------------------------------------------------------
  http.post(`${baseUrl}/journal-entries/:journalId/post`, ({ params }) => {
    const journalId = Number(params.journalId);
    const je = journalEntries.get(journalId);
    if (!je) return notFound('Journal entry not found');
    const { balanced } = recalcTotals(journalId);
    je.balanced = balanced;
    if (!balanced) {
      return HttpResponse.json(
        { error: 'Journal entry is not balanced' },
        { status: 400 },
      );
    }
    if (je.status === 'Posted') {
      return HttpResponse.json(
        { error: 'Journal entry already posted' },
        { status: 400 },
      );
    }
    je.status = 'Posted';
    je.postedDateTime = new Date().toISOString();
    je.posterUserId = 'usr-001';
    return HttpResponse.json({
      journalId,
      status: 'Posted',
      postedDateTime: je.postedDateTime,
      posterUserId: je.posterUserId,
    });
  }),
];
