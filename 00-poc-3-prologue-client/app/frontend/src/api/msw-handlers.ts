import { http, HttpResponse } from 'msw';

const BASE = import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:4000';

const companies = [
  { id: 'company-001', name: 'Fiserv Inc.', active: true },
  { id: 'company-002', name: 'Fiserv Financial Services', active: true },
];

const currencies = [
  { code: 'USD', name: 'US Dollar', isBase: true },
  { code: 'EUR', name: 'Euro', isBase: false },
  { code: 'GBP', name: 'British Pound', isBase: false },
];

const journalEntryTypes = [
  { code: 'JNL', name: 'Journal' },
  { code: 'ADJ', name: 'Adjustment' },
  { code: 'REV', name: 'Reversal' },
  { code: 'ACR', name: 'Accrual' },
  { code: 'CLO', name: 'Closing' },
];

const sourceDocuments = [
  { code: 'INV', name: 'Invoice' },
  { code: 'PO', name: 'Purchase Order' },
  { code: 'MEM', name: 'Memo' },
  { code: 'BANK', name: 'Bank Statement' },
];

const allocationMethods = [
  { id: 'alloc-001', name: 'Headcount Allocation' },
  { id: 'alloc-002', name: 'Revenue-Based Allocation' },
];

const routingRules = [
  { id: 'rr-001', name: 'Finance Manager Approval', description: 'Routes to Finance Manager for amounts > $10,000' },
  { id: 'rr-002', name: 'CFO Approval', description: 'Routes to CFO for amounts > $100,000' },
];

const accounts = [
  { id: 'acct-001', companyId: 'company-001', code: '1-394-7005-008-96', description: 'Payroll Expense', type: 'expense', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'acct-002', companyId: 'company-001', code: '1-741-7709-001-01', description: 'Prepaid Insurance', type: 'asset', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'acct-003', companyId: 'company-001', code: '2-100-1000-001-00', description: 'Accounts Payable', type: 'liability', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'acct-004', companyId: 'company-001', code: '1-100-1000-001-00', description: 'Cash and Cash Equivalents', type: 'asset', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'acct-005', companyId: 'company-001', code: '4-100-1000-001-00', description: 'Revenue from Services', type: 'revenue', active: true, createdAt: '2026-01-01T00:00:00Z' },
];

const journalEntries = [
  {
    id: 'je-001',
    companyId: 'company-001',
    entryType: 'JNL',
    status: 'Posted',
    transactionDate: '2026-01-31',
    autoReversalDate: null,
    description: 'Monthly Payroll January 2026',
    sourceDocument: 'MEM',
    allocationMethodId: null,
    routing: null,
    posted: true,
    postedAt: '2026-02-01T09:00:00Z',
    postedByUserId: 'dev-user-001',
    editedAt: '2026-02-01T09:00:00Z',
    editedByUserId: 'dev-user-001',
    createdAt: '2026-01-31T08:00:00Z',
    createdByUserId: 'dev-user-001',
    lines: [
      { lineNumber: 1, accountId: 'acct-001', accountCode: '1-394-7005-008-96', accountDescription: 'Payroll Expense', currencyId: 'USD', debit: 50000, credit: 0, description: 'Gross payroll', referenceNo: 'PAY-2026-01' },
      { lineNumber: 2, accountId: 'acct-004', accountCode: '1-100-1000-001-00', accountDescription: 'Cash and Cash Equivalents', currencyId: 'USD', debit: 0, credit: 50000, description: 'Net payroll disbursement', referenceNo: 'PAY-2026-01' },
    ],
    totalDebit: 50000, totalCredit: 50000, difference: 0, isBalanced: true,
    hasOpenQuestions: false, routingRuleId: null, submittedAt: null,
    approvedAt: null, approvedById: null, rejectionReason: null, rejectedAt: null, rejectedById: null,
  },
  {
    id: 'je-002',
    companyId: 'company-001',
    entryType: 'ACR',
    status: 'Unposted',
    transactionDate: '2026-01-31',
    autoReversalDate: '2026-02-01',
    description: 'Prepaid Insurance Accrual',
    sourceDocument: 'INV',
    allocationMethodId: null,
    routing: null,
    posted: false,
    postedAt: null,
    postedByUserId: null,
    editedAt: '2026-01-31T10:00:00Z',
    editedByUserId: 'dev-user-001',
    createdAt: '2026-01-31T10:00:00Z',
    createdByUserId: 'dev-user-001',
    lines: [
      { lineNumber: 1, accountId: 'acct-002', accountCode: '1-741-7709-001-01', accountDescription: 'Prepaid Insurance', currencyId: 'USD', debit: 1200, credit: 0, description: 'Insurance premium', referenceNo: 'INS-2026-01' },
      { lineNumber: 2, accountId: 'acct-003', accountCode: '2-100-1000-001-00', accountDescription: 'Accounts Payable', currencyId: 'USD', debit: 0, credit: 1200, description: 'Payable to insurer', referenceNo: 'INS-2026-01' },
    ],
    totalDebit: 1200, totalCredit: 1200, difference: 0, isBalanced: true,
    hasOpenQuestions: false, routingRuleId: null, submittedAt: null,
    approvedAt: null, approvedById: null, rejectionReason: null, rejectedAt: null, rejectedById: null,
  },
];

export const handlers = [
  http.get(`${BASE}/companies`, () => HttpResponse.json({ items: companies })),
  http.get(`${BASE}/currencies`, () => HttpResponse.json({ items: currencies })),
  http.get(`${BASE}/journal-entry-types`, () => HttpResponse.json({ items: journalEntryTypes })),
  http.get(`${BASE}/source-documents`, () => HttpResponse.json({ items: sourceDocuments })),
  http.get(`${BASE}/allocation-methods`, () => HttpResponse.json({ items: allocationMethods })),
  http.get(`${BASE}/routing-rules`, () => HttpResponse.json({ items: routingRules })),

  http.get(`${BASE}/journal-entries`, ({ request }) => {
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId') ?? '';
    const items = journalEntries.filter((je) => je.companyId === companyId);
    return HttpResponse.json({
      items,
      firstCursor: null, lastCursor: null, nextCursor: null, prevCursor: null,
      totalCount: items.length, isFirst: true, isLast: true,
    });
  }),

  http.get(`${BASE}/journal-entries/:id`, ({ params }) => {
    const je = journalEntries.find((j) => j.id === params['id']);
    if (!je) return HttpResponse.json({ status: 404 }, { status: 404 });
    return HttpResponse.json(je);
  }),

  http.post(`${BASE}/journal-entries`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newJe = { ...journalEntries[1], id: `je-${Date.now()}`, status: 'Unposted', ...body };
    return HttpResponse.json(newJe);
  }),

  http.put(`${BASE}/journal-entries/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const je = journalEntries.find((j) => j.id === params['id']);
    if (!je) return HttpResponse.json({ status: 404 }, { status: 404 });
    return HttpResponse.json({ ...je, ...body, editedAt: new Date().toISOString() });
  }),

  http.post(`${BASE}/journal-entries/:id/post`, ({ params }) => {
    const je = journalEntries.find((j) => j.id === params['id']);
    if (!je) return HttpResponse.json({ status: 404 }, { status: 404 });
    return HttpResponse.json({ ...je, status: 'Posted', posted: true, postedAt: new Date().toISOString() });
  }),

  http.post(`${BASE}/journal-entries/:id/unpost`, ({ params }) => {
    const je = journalEntries.find((j) => j.id === params['id']);
    if (!je) return HttpResponse.json({ status: 404 }, { status: 404 });
    return HttpResponse.json({ ...je, status: 'Unposted', posted: false, postedAt: null });
  }),

  http.post(`${BASE}/journal-entries/:id/submit-for-approval`, ({ params }) => {
    const je = journalEntries.find((j) => j.id === params['id']);
    if (!je) return HttpResponse.json({ status: 404 }, { status: 404 });
    return HttpResponse.json({ ...je, status: 'PendingApproval', submittedAt: new Date().toISOString() });
  }),

  http.get(`${BASE}/accounts`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    let items = accounts.filter((a) => a.companyId === (url.searchParams.get('companyId') ?? ''));
    if (search) items = items.filter((a) => a.code.toLowerCase().includes(search) || a.description.toLowerCase().includes(search));
    if (activeOnly) items = items.filter((a) => a.active);
    return HttpResponse.json({ items, totalCount: items.length, page: 1, pageSize: 20 });
  }),

  http.get(`${BASE}/accounts/:id`, ({ params }) => {
    const acct = accounts.find((a) => a.id === params['id']);
    if (!acct) return HttpResponse.json({ status: 404 }, { status: 404 });
    return HttpResponse.json(acct);
  }),

  http.post(`${BASE}/accounts`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: `acct-${Date.now()}`, active: true, createdAt: new Date().toISOString(), ...body }, { status: 201 });
  }),

  http.put(`${BASE}/accounts/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const acct = accounts.find((a) => a.id === params['id']);
    if (!acct) return HttpResponse.json({ status: 404 }, { status: 404 });
    return HttpResponse.json({ ...acct, ...body });
  }),

  http.get(`${BASE}/accounts/:id/balances`, ({ params }) => {
    return HttpResponse.json({
      accountId: params['id'],
      fiscalYearId: 'fy-2026',
      balances: [
        { periodId: 'p-01', periodName: 'Jan 2026', openingBalance: 0, totalDebit: 50000, totalCredit: 0, closingBalance: 50000 },
        { periodId: 'p-02', periodName: 'Feb 2026', openingBalance: 50000, totalDebit: 0, totalCredit: 0, closingBalance: 50000 },
      ],
    });
  }),
];

