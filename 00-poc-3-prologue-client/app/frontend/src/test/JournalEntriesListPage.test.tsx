import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import JournalEntriesListPage from '../features/journal/JournalEntriesListPage.js';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('../api/client.js', () => ({
  apiClient: {
    GET: vi.fn(async (path: string) => {
      if (path === '/companies') {
        return { data: { items: [{ id: 'c1', name: 'Fiserv Inc.', active: true }] } };
      }
      if (path === '/journal-entries') {
        return {
          data: {
            items: [
              { id: 'je-001', description: 'Monthly Payroll January 2026', status: 'Posted', transactionDate: '2026-01-31', entryType: 'JNL', totalDebit: 50000, totalCredit: 50000 },
              { id: 'je-002', description: 'Prepaid Insurance Accrual', status: 'Unposted', transactionDate: '2026-01-31', entryType: 'ACR', totalDebit: 1200, totalCredit: 1200 },
            ],
            totalCount: 2, isFirst: true, isLast: true,
          },
        };
      }
      return { data: null };
    }),
  },
}));

function renderPage() {
  const r = createMemoryRouter([
    { path: '/', element: <JournalEntriesListPage /> },
    { path: '/journal-entries/new', element: <div>new</div> },
    { path: '/journal-entries/:id', element: <div>edit</div> },
  ]);
  return render(<RouterProvider router={r} />);
}

describe('JournalEntriesListPage', () => {
  it('renders the New Entry button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'je.newEntry' })).toBeInTheDocument();
  });

  it('loads companies into the selector', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Fiserv Inc.' })).toBeInTheDocument();
    });
  });

  it('renders journal entries after company loads', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Monthly Payroll January 2026')).toBeInTheDocument();
    });
  });

  it('renders a Posted status badge', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Posted')).toBeInTheDocument();
    });
  });
});
