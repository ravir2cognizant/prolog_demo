export interface RouteInventoryEntry {
  path: string;
  component: string;
  ciCard: string;
  description: string;
  status: 'real' | 'stub';
}

export const ROUTE_INVENTORY: RouteInventoryEntry[] = [
  { path: '/journal-entries',      component: 'JournalEntriesListPage',      ciCard: 'CI-001–007', description: 'Journal Entry List',       status: 'real' },
  { path: '/journal-entries/new',  component: 'JournalEntryPage',            ciCard: 'CI-001–007', description: 'Create Journal Entry',     status: 'real' },
  { path: '/journal-entries/:id',  component: 'JournalEntryPage',            ciCard: 'CI-001–007', description: 'Edit Journal Entry',       status: 'real' },
  { path: '/accounts',             component: 'AccountMaintenancePage',       ciCard: 'CI-017',     description: 'Account Maintenance',      status: 'real' },
  { path: '/approval-queue',       component: 'ApprovalQueuePage',           ciCard: 'CI-008',     description: 'Approval Queue',           status: 'stub' },
  { path: '/financial-review',     component: 'FinancialReviewPage',         ciCard: 'CI-009',     description: 'Financial Review',         status: 'stub' },
  { path: '/accruals-prepaid',     component: 'AccrualsPrepaidPage',         ciCard: 'CI-010',     description: 'Accruals & Prepaid',       status: 'stub' },
  { path: '/allocation',           component: 'AllocationPage',              ciCard: 'CI-011',     description: 'Cost Allocation',          status: 'stub' },
  { path: '/report-designer',      component: 'FinancialReportDesignerPage', ciCard: 'CI-012',     description: 'Report Designer',          status: 'stub' },
  { path: '/budget',               component: 'BudgetManagementPage',        ciCard: 'CI-013',     description: 'Budget Management',        status: 'stub' },
  { path: '/consolidation',        component: 'ConsolidationPage',           ciCard: 'CI-014',     description: 'Consolidation',            status: 'stub' },
  { path: '/fiscal-year-control',  component: 'FiscalYearControlPage',       ciCard: 'CI-015',     description: 'Fiscal Year Control',      status: 'stub' },
  { path: '/transaction-import',   component: 'TransactionImportPage',       ciCard: 'CI-016',     description: 'Transaction Import',       status: 'stub' },
  { path: '/dev/routes',           component: 'RoutesPage',                  ciCard: 'DEV',        description: 'Route Inventory (Dev)',     status: 'real' },
];
