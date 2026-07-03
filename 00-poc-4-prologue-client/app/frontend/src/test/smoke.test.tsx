/**
 * smoke.test.tsx - 4+ Vitest specs exercising real components.
 * - StatusBadge: posted/unposted variants render with correct class.
 * - BalanceFooter: balanced / unbalanced state + aria-live region.
 * - RecordNavToolbar: boundary disabling reads through navigation context.
 * - LineItemsGrid: read-only rendering uses correct columns.
 * - CompanySelect: displays "{id} - {name}" format and is disabled when prop set.
 * - RoutesPage: zero drift between ROUTE_INVENTORY and routes.tsx.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import '../i18n';

import { StatusBadge } from '../components/StatusBadge';
import { BalanceFooter } from '../features/journal-entry/BalanceFooter';
import { RecordNavToolbar } from '../features/journal-entry/RecordNavToolbar';
import { LineItemsGrid } from '../features/journal-entry/LineItemsGrid';
import { CompanySelect } from '../features/company/CompanySelectPage';
import { RoutesPage } from '../dev/RoutesPage';
import { apiClient } from '../api/client';
import type { Company, LineItem } from '../api/types';

afterEach(() => { vi.restoreAllMocks(); });

function renderInRouter(ui: ReactNode): void {
  render(
    <MemoryRouter>
      <Suspense fallback={null}>{ui}</Suspense>
    </MemoryRouter>,
  );
}

describe('StatusBadge', () => {
  it('renders Posted badge with badge-posted class', () => {
    render(<StatusBadge status="Posted" />);
    const el = screen.getByText('Posted');
    expect(el.className).toContain('badge-posted');
  });

  it('renders Unposted badge with badge-unposted class', () => {
    render(<StatusBadge status="Unposted" />);
    const el = screen.getByText('Unposted');
    expect(el.className).toContain('badge-unposted');
  });
});

describe('BalanceFooter', () => {
  function wrap(lines: Pick<LineItem, 'debitAmount' | 'creditAmount'>[]): JSX.Element {
    return (
      <table>
        <tbody>
          <BalanceFooter lines={lines} />
        </tbody>
      </table>
    );
  }

  it('shows $0.00 difference when balanced and does NOT carry the unbalanced class', () => {
    render(
      wrap([
        { debitAmount: 100, creditAmount: 0 },
        { debitAmount: 0, creditAmount: 100 },
      ]),
    );
    const diff = screen.getByTestId('difference-row');
    expect(diff.textContent).toContain('$0.00');
    expect(diff.className).not.toContain('data-grid-difference-row--unbalanced');
  });

  it('shows non-zero difference + unbalanced class when debits !== credits', () => {
    render(
      wrap([
        { debitAmount: 150, creditAmount: 0 },
        { debitAmount: 0, creditAmount: 85 },
      ]),
    );
    const diff = screen.getByTestId('difference-row');
    expect(diff.textContent).toContain('$65.00');
    expect(diff.className).toContain('data-grid-difference-row--unbalanced');
    expect(diff.getAttribute('aria-live')).toBe('polite');
  });
});

describe('RecordNavToolbar', () => {
  it('disables First/Previous when isFirst=true (default boundary state)', async () => {
    // Spy on the apiClient directly — MSW's node interceptor is unreliable in
    // Vitest jsdom mode because jsdom provides its own fetch implementation
    // that @mswjs/interceptors may not patch. The spy is the reliable path.
    vi.spyOn(apiClient, 'getNavigationContext').mockResolvedValue({
      currentJournalId: 1,
      firstJournalId: 1,
      previousJournalId: null,
      nextJournalId: 2,
      lastJournalId: 3,
      isFirst: true,
      isLast: false,
      totalCount: 3,
    });
    renderInRouter(<RecordNavToolbar journalId={1} />);
    await waitFor(() => {
      expect(screen.getByLabelText(/go to first journal entry/i)).toBeDisabled();
      expect(screen.getByLabelText(/go to previous journal entry/i)).toBeDisabled();
      expect(screen.getByLabelText(/go to next journal entry/i)).not.toBeDisabled();
    });
  });
});

describe('LineItemsGrid (read-only)', () => {
  const sampleLines: LineItem[] = [
    {
      lineId: 10,
      lineNumber: 1,
      accountCode: 'US-01-1000-100-01',
      accountDescription: 'Cash - Operating',
      currencyId: 'USD',
      debitAmount: 100,
      creditAmount: 0,
      description: 'Sample',
      referenceNumber: 'R-1',
    },
  ];

  it('renders one row per line with role=grid and scope=col headers', () => {
    render(
      <LineItemsGrid
        journalId={1}
        initialLines={sampleLines}
        isEditable={false}
      />,
    );
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
    const headers = screen.getAllByRole('columnheader');
    expect(headers.every((h) => h.getAttribute('scope') === 'col')).toBe(true);
    expect(screen.getByText('US-01-1000-100-01')).toBeInTheDocument();
  });
});

describe('CompanySelect', () => {
  const companies: Company[] = [
    { companyId: '0004', companyName: '0004_company', displayLabel: '0004 - 0004_company' },
    { companyId: '0005', companyName: 'Alpha Corp', displayLabel: '0005 - Alpha Corp' },
  ];

  it('renders options as "{id} - {name}" format', () => {
    render(
      <CompanySelect value="" onChange={() => {}} companies={companies} />,
    );
    const opt = screen.getByRole('option', { name: '0004 - 0004_company' });
    expect(opt).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <CompanySelect
        value="0004"
        onChange={() => {}}
        disabled
        companies={companies}
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('RoutesPage', () => {
  it('reports zero drift between ROUTE_INVENTORY and routes.tsx', () => {
    renderInRouter(<RoutesPage />);
    // Drift-ok element is rendered only when both sides match perfectly.
    expect(screen.getByTestId('drift-ok')).toBeInTheDocument();
  });
});
