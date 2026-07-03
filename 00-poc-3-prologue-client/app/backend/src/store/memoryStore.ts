import type {
  Company, Currency, JournalEntryType, SourceDocument, AllocationMethod,
  RoutingRule, Account, JournalEntry, FiscalYear, Period,
  AccrualSchedule, AllocationRule, Budget, ConsolidationSource,
  ConsolidationRun, ReportDesign, TransactionImportJob,
} from '../domain/types.js';

export const store = {
  companies: new Map<string, Company>(),
  currencies: new Map<string, Currency>(),
  journalEntryTypes: new Map<string, JournalEntryType>(),
  sourceDocuments: new Map<string, SourceDocument>(),
  allocationMethods: new Map<string, AllocationMethod>(),
  routingRules: new Map<string, RoutingRule>(),
  accounts: new Map<string, Account>(),
  journalEntries: new Map<string, JournalEntry>(),
  fiscalYears: new Map<string, FiscalYear>(),
  periods: new Map<string, Period>(),
  accrualSchedules: new Map<string, AccrualSchedule>(),
  allocationRules: new Map<string, AllocationRule>(),
  budgets: new Map<string, Budget>(),
  consolidationSources: new Map<string, ConsolidationSource>(),
  consolidationRuns: new Map<string, ConsolidationRun>(),
  reportDesigns: new Map<string, ReportDesign>(),
  importJobs: new Map<string, TransactionImportJob>(),
};
