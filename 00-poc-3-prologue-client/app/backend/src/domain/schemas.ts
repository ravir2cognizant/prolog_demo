import { z } from 'zod';

// ── Shared primitives ──────────────────────────────────────────────────────

export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD');
export const NonEmptyStr = z.string().min(1);
export const PageNum = z.coerce.number().int().min(1).default(1);
export const PageSize = z.coerce.number().int().min(1).max(100).default(20);

// ── Journal Entries ────────────────────────────────────────────────────────

export const JELineInputSchema = z.object({
  accountId: NonEmptyStr,
  currencyId: NonEmptyStr,
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().max(500).default(''),
  referenceNo: z.string().max(100).default(''),
});

export const CreateJEBodySchema = z.object({
  companyId: NonEmptyStr,
  entryType: NonEmptyStr,
  transactionDate: IsoDate,
  autoReversalDate: IsoDate.optional(),
  description: z.string().max(500),
  sourceDocument: z.string().default(''),
  allocationMethodId: z.string().optional(),
  routing: z.string().max(100).optional(),
  lines: z.array(JELineInputSchema).default([]),
});

export const UpdateJEBodySchema = z.object({
  companyId: z.string().optional(),
  entryType: z.string().optional(),
  transactionDate: IsoDate.optional(),
  autoReversalDate: IsoDate.optional().nullable(),
  description: z.string().max(500).optional(),
  sourceDocument: z.string().optional(),
  allocationMethodId: z.string().optional().nullable(),
  routing: z.string().max(100).optional().nullable(),
  lines: z.array(JELineInputSchema).optional(),
});

export const ListJEQuerySchema = z.object({
  companyId: NonEmptyStr,
  cursor: z.string().optional(),
  direction: z.enum(['next', 'prev']).default('next'),
  pageSize: PageSize,
  fromDate: IsoDate.optional(),
  toDate: IsoDate.optional(),
  status: z.string().optional(),
  entryType: z.string().optional(),
  pendingApproval: z.coerce.boolean().optional(),
  approverId: z.string().optional(),
  hasOpenQuestions: z.coerce.boolean().optional(),
});

export const ExportJEQuerySchema = z.object({
  companyId: NonEmptyStr,
  fromDate: IsoDate.optional(),
  toDate: IsoDate.optional(),
  status: z.string().optional(),
  format: z.enum(['csv', 'xlsx']).default('csv'),
});

export const ReverseBodySchema = z.object({
  reversalDate: IsoDate.optional(),
});

export const RejectBodySchema = z.object({
  rejectionReason: z.string().min(1).max(1000),
});

// ── Accounts ───────────────────────────────────────────────────────────────

export const AccountTypeEnum = z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']);

export const SearchAccountsQuerySchema = z.object({
  companyId: NonEmptyStr,
  search: z.string().optional(),
  activeOnly: z.coerce.boolean().default(false),
  type: AccountTypeEnum.optional(),
  page: PageNum,
  pageSize: PageSize,
});

export const CreateAccountBodySchema = z.object({
  companyId: NonEmptyStr,
  code: NonEmptyStr,
  description: z.string().max(200),
  type: AccountTypeEnum,
  active: z.boolean().default(true),
});

export const UpdateAccountBodySchema = z.object({
  description: z.string().max(200).optional(),
  type: AccountTypeEnum.optional(),
  active: z.boolean().optional(),
});

export const AccountBalancesQuerySchema = z.object({
  fiscalYearId: NonEmptyStr,
});

// ── Fiscal Years ───────────────────────────────────────────────────────────

export const ListFiscalYearsQuerySchema = z.object({
  companyId: NonEmptyStr,
});

export const CreateFiscalYearBodySchema = z.object({
  companyId: NonEmptyStr,
  name: z.string().max(100),
  startDate: IsoDate,
  endDate: IsoDate,
  periodCount: z.literal(12).or(z.literal(13)),
});

// ── Accrual Schedules ──────────────────────────────────────────────────────

export const ListAccrualsQuerySchema = z.object({
  companyId: z.string().optional(),
  status: z.enum(['Active', 'Cancelled']).optional(),
});

export const CreateAccrualBodySchema = z.object({
  companyId: NonEmptyStr,
  description: z.string().max(500),
  scheduleType: z.enum(['Monthly', 'Quarterly', 'Custom']),
  startDate: IsoDate,
  endDate: IsoDate.optional(),
  baseEntry: z.record(z.unknown()),
  reversalOffset: z.number().int().min(1).default(1),
});

export const UpdateAccrualBodySchema = z.object({
  description: z.string().max(500).optional(),
  endDate: IsoDate.optional(),
});

// ── Allocation Rules ───────────────────────────────────────────────────────

export const ListAllocationRulesQuerySchema = z.object({
  companyId: z.string().optional(),
});

export const AllocationTargetSchema = z.object({
  accountId: NonEmptyStr,
  value: z.number().positive(),
});

export const CreateAllocationRuleBodySchema = z.object({
  companyId: NonEmptyStr,
  name: z.string().max(200),
  sourceAccountId: NonEmptyStr,
  allocationBasis: z.enum(['Percentage', 'FixedAmount']),
  targets: z.array(AllocationTargetSchema).min(1),
});

export const UpdateAllocationRuleBodySchema = z.object({
  name: z.string().max(200).optional(),
  sourceAccountId: z.string().optional(),
  allocationBasis: z.enum(['Percentage', 'FixedAmount']).optional(),
  targets: z.array(AllocationTargetSchema).optional(),
});

export const RunAllocationBodySchema = z.object({
  fiscalYearId: NonEmptyStr,
  periodId: NonEmptyStr,
});

// ── Budgets ────────────────────────────────────────────────────────────────

export const GetBudgetsQuerySchema = z.object({
  companyId: NonEmptyStr,
  fiscalYear: z.coerce.number().int().min(2000).max(2100),
});

export const BudgetUpdateItemSchema = z.object({
  accountId: NonEmptyStr,
  periodId: NonEmptyStr,
  amount: z.number().min(0),
});

export const UpdateBudgetsBodySchema = z.object({
  companyId: NonEmptyStr,
  fiscalYear: z.number().int().min(2000).max(2100),
  updates: z.array(BudgetUpdateItemSchema).min(1),
});

export const ExportBudgetsQuerySchema = z.object({
  companyId: NonEmptyStr,
  fiscalYear: z.coerce.number().int().min(2000).max(2100),
  format: z.enum(['csv', 'xlsx']).default('csv'),
});

// ── Consolidation ──────────────────────────────────────────────────────────

export const AddConsolidationSourceBodySchema = z.object({
  name: z.string().max(200),
  sourceType: z.enum(['database', 'file']),
  connectionConfig: z.record(z.unknown()),
});

export const RunConsolidationBodySchema = z.object({
  fiscalYear: z.number().int().min(2000).max(2100),
  periodId: z.string().optional(),
});

export const ListConsolidationRunsQuerySchema = z.object({
  pageSize: PageSize,
  page: PageNum,
});

// ── Report Designs ─────────────────────────────────────────────────────────

export const ListReportDesignsQuerySchema = z.object({
  search: z.string().optional(),
});

export const ReportRowDefSchema = z.object({
  label: z.string().max(200),
  accountId: z.string().nullable().optional().transform((v) => v ?? null),
  accountGroupId: z.string().nullable().optional().transform((v) => v ?? null),
});

export const SaveReportDesignBodySchema = z.object({
  name: z.string().max(200),
  description: z.string().max(1000).default(''),
  rowDefinitions: z.array(ReportRowDefSchema).min(1),
  columnPeriods: z.array(NonEmptyStr).min(1),
});

export const UpdateReportDesignBodySchema = SaveReportDesignBodySchema.partial();

export const RunReportBodySchema = z.object({
  dataSourceType: z.enum(['operational', 'consolidated']).default('operational'),
});

export const ExportReportQuerySchema = z.object({
  format: z.enum(['pdf', 'xlsx']),
});

// ── Transactions ───────────────────────────────────────────────────────────

export const ListImportErrorsQuerySchema = z.object({
  page: PageNum,
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const ExportTransactionsQuerySchema = z.object({
  companyId: NonEmptyStr,
  fromDate: IsoDate,
  toDate: IsoDate,
  format: z.enum(['csv', 'xlsx']).default('csv'),
});

// ── Short-name aliases (used by route files) ───────────────────────────────
export const CreateJESchema = CreateJEBodySchema;
export const UpdateJESchema = UpdateJEBodySchema;
export const ListJESchema = ListJEQuerySchema;
export const ExportJESchema = ExportJEQuerySchema;
export const ReverseSchema = ReverseBodySchema;
export const RejectSchema = RejectBodySchema;
export const SearchAccountsSchema = SearchAccountsQuerySchema;
export const CreateAccountSchema = CreateAccountBodySchema;
export const UpdateAccountSchema = UpdateAccountBodySchema;
export const AccountBalancesSchema = AccountBalancesQuerySchema;
export const ListFiscalYearsSchema = ListFiscalYearsQuerySchema;
export const CreateFiscalYearSchema = CreateFiscalYearBodySchema;
export const ListAccrualsSchema = ListAccrualsQuerySchema;
export const CreateAccrualSchema = CreateAccrualBodySchema;
export const UpdateAccrualSchema = UpdateAccrualBodySchema;
export const ListAllocationRulesSchema = ListAllocationRulesQuerySchema;
export const CreateAllocationRuleSchema = CreateAllocationRuleBodySchema;
export const UpdateAllocationRuleSchema = UpdateAllocationRuleBodySchema;
export const RunAllocationSchema = RunAllocationBodySchema;
export const GetBudgetsSchema = GetBudgetsQuerySchema;
export const UpdateBudgetsSchema = UpdateBudgetsBodySchema;
export const ExportBudgetsSchema = ExportBudgetsQuerySchema;
export const AddConsolidationSourceSchema = AddConsolidationSourceBodySchema;
export const RunConsolidationSchema = RunConsolidationBodySchema;
export const ListConsolidationRunsSchema = ListConsolidationRunsQuerySchema;
export const ListReportDesignsSchema = ListReportDesignsQuerySchema;
export const SaveReportDesignSchema = SaveReportDesignBodySchema;
export const UpdateReportDesignSchema = UpdateReportDesignBodySchema;
export const RunReportSchema = RunReportBodySchema;
export const ExportReportSchema = ExportReportQuerySchema;
export const ListImportErrorsSchema = ListImportErrorsQuerySchema;
export const ExportTransactionsSchema = ExportTransactionsQuerySchema;
