/**
 * Frontend API types.
 * Mirrors BFF domain types from app/backend/src/domain/types.ts to keep
 * the wire contract a single source of truth.
 */

export type JEStatus = 'Unposted' | 'Posted';

export interface NavItem {
  id: string;
  label: string;
  route: string;
  level: 0 | 1;
  parentId: string | null;
  alertState: boolean;
  enabled: boolean;
}

export interface Company {
  companyId: string;
  companyName: string;
  displayLabel: string;
}

export interface JournalEntryType {
  typeCode: string;
  typeLabel: string;
}

export interface Account {
  accountCode: string;
  accountDescription: string;
  isValid: boolean;
  segment1: string;
  segment2: string;
  segment3: string;
  segment4: string;
  segment5: string;
}

export interface LineItem {
  lineId: number;
  lineNumber: number;
  accountCode: string;
  accountDescription: string;
  currencyId: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  referenceNumber: string;
}

export interface JournalTotals {
  totalDebits: number;
  totalCredits: number;
  difference: number;
}

export interface JournalEntry {
  journalId: number;
  companyId: string;
  companyName: string;
  journalEntryType: string;
  journalNumber: number;
  status: JEStatus;
  transactionDate: string;
  editDateTime: string;
  editUserId: string;
  autoReversalDate: string | null;
  description: string;
  postingSession: string | null;
  sourceDocument: string | null;
  glImport: string | null;
  allocationMethodId: string | null;
  balanced: boolean;
  postedDateTime: string | null;
  posterUserId: string | null;
}

export interface JournalEntryFull extends JournalEntry {
  lines: LineItem[];
  totals: JournalTotals;
}

export interface NavigationContext {
  currentJournalId: number;
  firstJournalId: number | null;
  previousJournalId: number | null;
  nextJournalId: number | null;
  lastJournalId: number | null;
  isFirst: boolean;
  isLast: boolean;
  totalCount: number;
}

export interface CreateJournalEntryRequest {
  companyId: string;
  journalEntryType: string;
  transactionDate: string;
  description: string;
  autoReversalDate?: string | null;
  allocationMethodId?: string | null;
}

export interface CreateJournalEntryResponse {
  journalId: number;
  journalNumber: number;
  status: 'Unposted';
  editDateTime: string;
  editUserId: string;
}

export interface UpdateJournalEntryRequest {
  journalEntryType?: string;
  transactionDate?: string;
  description?: string;
  autoReversalDate?: string | null;
  allocationMethodId?: string | null;
}

export interface UpdateJournalEntryResponse {
  journalId: number;
  editDateTime: string;
  editUserId: string;
}

export interface PostJournalEntryResponse {
  journalId: number;
  status: 'Posted';
  postedDateTime: string;
  posterUserId: string;
}

export interface CreateLineItemRequest {
  accountCode: string;
  currencyId: string;
  debitAmount?: number;
  creditAmount?: number;
  description?: string;
  referenceNumber?: string;
}

export interface UpdateLineItemRequest {
  accountCode?: string;
  currencyId?: string;
  debitAmount?: number;
  creditAmount?: number;
  description?: string;
  referenceNumber?: string;
}

export interface ApiError {
  error: string;
  field?: string;
}
