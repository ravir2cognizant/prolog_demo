import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import JournalEntryPage from '../features/journal/JournalEntryPage.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const REF_JE = {
  id: 'je-001',
  companyId: 'c1',
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
  postedByUserId: 'u1',
  editedAt: '2026-02-01T09:00:00Z',
  editedByUserId: 'u1',
  createdAt: '2026-01-31T08:00:00Z',
  createdByUserId: 'u1',
  lines: [
    { lineNumber: 1, accountId: 'a1', accountCode: '1-001', accountDescription: 'Payroll', currencyId: 'USD', debit: 50000, credit: 0, description: 'Gross payroll', referenceNo: 'PAY-01' },
    { lineNumber: 2, accountId: 'a2', accountCode: '1-002', accountDescription: 'Cash', currencyId: 'USD', debit: 0, credit: 50000, description: 'Net payroll', referenceNo: 'PAY-01' },
  ],
  totalDebit: 50000, totalCredit: 50000, difference: 0, isBalanced: true,
  hasOpenQuestions: false, routingRuleId: null, submittedAt: null,
  approvedAt: null, approvedById: null, rejectionReason: null, rejectedAt: null, rejectedById: null,
};

vi.mock('../api/client.js', () => ({
  apiClient: {
    GET: vi.fn(async (path: string) => {
      if (path === '/companies') return { data: { items: [{ id: 'c1', name: 'Fiserv Inc.', active: true }] } };
      if (path === '/currencies') return { data: { items: [{ code: 'USD', name: 'US Dollar', isBase: true }] } };
      if (path === '/journal-entry-types') return { data: { items: [{ code: 'JNL', name: 'Journal' }] } };
      if (path === '/source-documents') return { data: { items: [{ code: 'MEM', name: 'Memo' }] } };
      if (path === '/allocation-methods') return { data: { items: [] } };
      if (path === '/routing-rules') return { data: { items: [] } };
      if (path === '/journal-entries/{id}') return { data: REF_JE };
      if (path === '/accounts') return { data: { items: [], totalCount: 0, page: 1, pageSize: 20 } };
      return { data: null };
    }),
    POST: vi.fn(async () => ({ data: { ...REF_JE, status: 'Posted' } })),
    PUT: vi.fn(async () => ({ data: REF_JE })),
  },
}));

function renderNewPage() {
  const r = createMemoryRouter([
    { path: '/', element: <JournalEntryPage /> },
    { path: '/journal-entries', element: <div>list</div> },
    { path: '/journal-entries/:id', element: <JournalEntryPage /> },
  ]);
  return render(<RouterProvider router={r} />);
}

function renderEditPage(id: string) {
  const r = createMemoryRouter(
    [
      { path: '/journal-entries/:id', element: <JournalEntryPage /> },
      { path: '/journal-entries', element: <div>list</div> },
    ],
    { initialEntries: [`/journal-entries/${id}`] },
  );
  return render(<RouterProvider router={r} />);
}

describe('JournalEntryPage — create mode', () => {
  it('shows lines section after ref data loads', async () => {
    renderNewPage();
    await waitFor(() => {
      expect(screen.getByText('je.lines')).toBeInTheDocument();
    });
  });

  it('renders Add Line button', async () => {
    renderNewPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'je.addLine' })).toBeInTheDocument();
    });
  });

  it('renders Save and Cancel buttons', async () => {
    renderNewPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'common.save' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'common.cancel' })).toBeInTheDocument();
  });
});

describe('JournalEntryPage — edit mode', () => {
  it('loads existing entry and shows Posted status badge', async () => {
    renderEditPage('je-001');
    await waitFor(() => {
      expect(screen.getByText('Posted')).toBeInTheDocument();
    });
  });
});
