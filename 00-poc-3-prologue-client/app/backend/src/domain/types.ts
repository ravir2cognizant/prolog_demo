export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type JEStatus = 'Unposted' | 'Posted' | 'PendingApproval' | 'Approved';
export type PeriodStatus = 'Open' | 'Closed';
export type FiscalYearStatus = 'Open' | 'Closed' | 'YearEndClosed';
export type AllocationBasis = 'Percentage' | 'FixedAmount';
export type ScheduleType = 'Monthly' | 'Quarterly' | 'Custom';
export type ScheduleStatus = 'Active' | 'Cancelled';
export type ConsolidationSourceType = 'database' | 'file';
export type ConsolidationSourceStatus = 'Active' | 'Inactive';
export type ConsolidationRunStatus = 'Completed' | 'PartialSuccess' | 'Failed';
export type ImportJobStatus = 'Queued' | 'Processing' | 'Completed' | 'Failed';

export interface Company {
  id: string;
  name: string;
  active: boolean;
}

export interface Currency {
  code: string;
  name: string;
  isBase: boolean;
}

export interface JournalEntryType {
  code: string;
  name: string;
}

export interface SourceDocument {
  code: string;
  name: string;
}

export interface AllocationMethod {
  id: string;
  name: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  description: string;
}

export interface Account {
  id: string;
  companyId: string;
  code: string;
  description: string;
  type: AccountType;
  active: boolean;
  createdAt: string;
  createdByUserId: string;
  updatedAt: string;
  updatedByUserId: string;
}

export interface JournalEntryLine {
  lineNumber: number;
  accountId: string;
  accountCode: string;
  accountDescription: string;
  currencyId: string;
  debit: number;
  credit: number;
  description: string;
  referenceNo: string;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  entryType: string;
  status: JEStatus;
  transactionDate: string;
  autoReversalDate: string | null;
  description: string;
  sourceDocument: string;
  allocationMethodId: string | null;
  routing: string | null;
  posted: boolean;
  postedAt: string | null;
  postedByUserId: string | null;
  editedAt: string;
  editedByUserId: string;
  createdAt: string;
  createdByUserId: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
  hasOpenQuestions: boolean;
  routingRuleId: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  rejectionReason: string | null;
  rejectedAt: string | null;
  rejectedById: string | null;
}

export interface FiscalYear {
  id: string;
  companyId: string;
  name: string;
  startDate: string;
  endDate: string;
  periodCount: number;
  status: FiscalYearStatus;
  createdAt: string;
}

export interface Period {
  id: string;
  fiscalYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  sequence: number;
}

export interface AccrualScheduleEntry {
  entryId: string;
  entryType: 'Accrual' | 'Reversal';
  transactionDate: string;
  status: string;
  totalDebit: number;
  totalCredit: number;
}

export interface AccrualSchedule {
  id: string;
  companyId: string;
  description: string;
  scheduleType: ScheduleType;
  startDate: string;
  endDate: string | null;
  status: ScheduleStatus;
  baseEntry: Record<string, unknown>;
  reversalOffset: number;
  entryCount: number;
  entries: AccrualScheduleEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AllocationTarget {
  accountId: string;
  value: number;
}

export interface AllocationRule {
  id: string;
  companyId: string;
  name: string;
  sourceAccountId: string;
  sourceAccountCode: string;
  allocationBasis: AllocationBasis;
  targets: AllocationTarget[];
  targetCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAmount {
  periodId: string;
  amount: number;
}

export interface BudgetRow {
  accountId: string;
  accountCode: string;
  accountDescription: string;
  budgets: BudgetAmount[];
}

export interface Budget {
  companyId: string;
  fiscalYear: number;
  rows: BudgetRow[];
}

export interface ConsolidationSource {
  id: string;
  name: string;
  sourceType: ConsolidationSourceType;
  status: ConsolidationSourceStatus;
  connectionConfig: Record<string, unknown>;
  lastRunAt: string | null;
  createdAt: string;
}

export interface ConsolidationRunSourceResult {
  sourceId: string;
  sourceName: string;
  status: 'Success' | 'PartialSuccess' | 'Failed';
  recordsProcessed: number;
  errors: Array<{ code: string; message: string }>;
}

export interface ConsolidationRun {
  id: string;
  status: ConsolidationRunStatus;
  fiscalYear: number;
  periodId: string | null;
  startedAt: string;
  completedAt: string;
  sourceCount: number;
  errorCount: number;
  sources: ConsolidationRunSourceResult[];
}

export interface ReportRowDefinition {
  label: string;
  accountId: string | null;
  accountGroupId: string | null;
}

export interface ReportDesign {
  id: string;
  name: string;
  description: string;
  rowDefinitions: ReportRowDefinition[];
  columnPeriods: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TransactionImportError {
  rowNumber: number;
  field: string | null;
  code: string;
  message: string;
}

export interface TransactionImportJob {
  jobId: string;
  companyId: string;
  submittedBy: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  importedCount: number;
  errorCount: number;
  errors: TransactionImportError[];
  submittedAt: string;
  completedAt: string | null;
}

export interface Principal {
  sub: string;
  roles: string[];
}
