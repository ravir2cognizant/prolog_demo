import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import AdminShell from './layouts/AdminShell.js';

const JournalEntriesListPage = lazy(() => import('./features/journal/JournalEntriesListPage.js'));
const JournalEntryPage = lazy(() => import('./features/journal/JournalEntryPage.js'));
const AccountMaintenancePage = lazy(() => import('./features/accounts/AccountMaintenancePage.js'));
const ApprovalQueuePage = lazy(() => import('./features/stubs/ApprovalQueuePage.js'));
const FinancialReviewPage = lazy(() => import('./features/stubs/FinancialReviewPage.js'));
const AccrualsPrepaidPage = lazy(() => import('./features/stubs/AccrualsPrepaidPage.js'));
const AllocationPage = lazy(() => import('./features/stubs/AllocationPage.js'));
const FinancialReportDesignerPage = lazy(() => import('./features/stubs/FinancialReportDesignerPage.js'));
const BudgetManagementPage = lazy(() => import('./features/stubs/BudgetManagementPage.js'));
const ConsolidationPage = lazy(() => import('./features/stubs/ConsolidationPage.js'));
const FiscalYearControlPage = lazy(() => import('./features/stubs/FiscalYearControlPage.js'));
const TransactionImportPage = lazy(() => import('./features/stubs/TransactionImportPage.js'));
const RoutesPage = lazy(() => import('./dev/RoutesPage.js'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-full py-16 text-text-secondary text-sm">
      Loading...
    </div>
  );
}

function wrap(el: React.ReactElement) {
  return <Suspense fallback={<Loading />}>{el}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminShell />,
    children: [
      { index: true, element: <Navigate to="/journal-entries" replace /> },
      { path: 'journal-entries', element: wrap(<JournalEntriesListPage />) },
      { path: 'journal-entries/new', element: wrap(<JournalEntryPage />) },
      { path: 'journal-entries/:id', element: wrap(<JournalEntryPage />) },
      { path: 'accounts', element: wrap(<AccountMaintenancePage />) },
      { path: 'approval-queue', element: wrap(<ApprovalQueuePage />) },
      { path: 'financial-review', element: wrap(<FinancialReviewPage />) },
      { path: 'accruals-prepaid', element: wrap(<AccrualsPrepaidPage />) },
      { path: 'allocation', element: wrap(<AllocationPage />) },
      { path: 'report-designer', element: wrap(<FinancialReportDesignerPage />) },
      { path: 'budget', element: wrap(<BudgetManagementPage />) },
      { path: 'consolidation', element: wrap(<ConsolidationPage />) },
      { path: 'fiscal-year-control', element: wrap(<FiscalYearControlPage />) },
      { path: 'transaction-import', element: wrap(<TransactionImportPage />) },
    ],
  },
  {
    path: '/dev/routes',
    element: wrap(<RoutesPage />),
  },
]);
