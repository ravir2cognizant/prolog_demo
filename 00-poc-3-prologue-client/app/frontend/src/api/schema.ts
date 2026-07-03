export interface Company { id: string; name: string; active: boolean; }
export interface Currency { code: string; name: string; isBase: boolean; }
export interface RefItem { code: string; name: string; }
export interface AllocMethod { id: string; name: string; }
export interface RoutingRule { id: string; name: string; description: string; }

export interface JELine {
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
  status: 'Unposted' | 'Posted' | 'PendingApproval' | 'Approved';
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
  lines: JELine[];
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

export interface JEListResponse {
  items: JournalEntry[];
  firstCursor: string | null;
  lastCursor: string | null;
  nextCursor: string | null;
  prevCursor: string | null;
  totalCount: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface Account {
  id: string;
  companyId: string;
  code: string;
  description: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  active: boolean;
  createdAt: string;
}

export interface AccountListResponse {
  items: Account[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AccountBalance {
  periodId: string;
  periodName: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
}

export interface paths {
  '/companies': {
    get: {
      parameters: { query?: { active?: boolean } };
      responses: { 200: { content: { 'application/json': { items: Company[] } } } };
    };
  };
  '/currencies': {
    get: {
      parameters: Record<string, never>;
      responses: { 200: { content: { 'application/json': { items: Currency[] } } } };
    };
  };
  '/journal-entry-types': {
    get: {
      parameters: Record<string, never>;
      responses: { 200: { content: { 'application/json': { items: RefItem[] } } } };
    };
  };
  '/source-documents': {
    get: {
      parameters: Record<string, never>;
      responses: { 200: { content: { 'application/json': { items: RefItem[] } } } };
    };
  };
  '/allocation-methods': {
    get: {
      parameters: Record<string, never>;
      responses: { 200: { content: { 'application/json': { items: AllocMethod[] } } } };
    };
  };
  '/routing-rules': {
    get: {
      parameters: Record<string, never>;
      responses: { 200: { content: { 'application/json': { items: RoutingRule[] } } } };
    };
  };
  '/journal-entries': {
    get: {
      parameters: {
        query: {
          companyId: string;
          cursor?: string;
          direction?: 'next' | 'prev';
          pageSize?: number;
          fromDate?: string;
          toDate?: string;
          status?: string;
          entryType?: string;
        };
      };
      responses: { 200: { content: { 'application/json': JEListResponse } } };
    };
    post: {
      requestBody: {
        content: {
          'application/json': {
            companyId: string;
            entryType: string;
            transactionDate: string;
            autoReversalDate?: string;
            description: string;
            sourceDocument?: string;
            allocationMethodId?: string;
            routing?: string;
            lines?: Omit<JELine, 'lineNumber' | 'accountCode' | 'accountDescription'>[];
          };
        };
      };
      responses: { 200: { content: { 'application/json': JournalEntry } } };
    };
  };
  '/journal-entries/{id}': {
    get: {
      parameters: { path: { id: string } };
      responses: { 200: { content: { 'application/json': JournalEntry } } };
    };
    put: {
      parameters: { path: { id: string } };
      requestBody: { content: { 'application/json': Partial<JournalEntry> & { lines?: Omit<JELine, 'lineNumber' | 'accountCode' | 'accountDescription'>[] } } };
      responses: { 200: { content: { 'application/json': JournalEntry } } };
    };
  };
  '/journal-entries/{id}/post': {
    post: {
      parameters: { path: { id: string } };
      responses: { 200: { content: { 'application/json': JournalEntry } } };
    };
  };
  '/journal-entries/{id}/unpost': {
    post: {
      parameters: { path: { id: string } };
      responses: { 200: { content: { 'application/json': JournalEntry } } };
    };
  };
  '/journal-entries/{id}/reverse': {
    post: {
      parameters: { path: { id: string } };
      requestBody: { content: { 'application/json': { reversalDate?: string } } };
      responses: { 200: { content: { 'application/json': JournalEntry } } };
    };
  };
  '/journal-entries/{id}/submit-for-approval': {
    post: {
      parameters: { path: { id: string } };
      responses: { 200: { content: { 'application/json': JournalEntry } } };
    };
  };
  '/accounts': {
    get: {
      parameters: {
        query: {
          companyId: string;
          search?: string;
          activeOnly?: boolean;
          page?: number;
          pageSize?: number;
        };
      };
      responses: { 200: { content: { 'application/json': AccountListResponse } } };
    };
    post: {
      requestBody: {
        content: {
          'application/json': {
            companyId: string;
            code: string;
            description: string;
            type: Account['type'];
            active?: boolean;
          };
        };
      };
      responses: { 201: { content: { 'application/json': Account } } };
    };
  };
  '/accounts/{id}': {
    get: {
      parameters: { path: { id: string } };
      responses: { 200: { content: { 'application/json': Account } } };
    };
    put: {
      parameters: { path: { id: string } };
      requestBody: {
        content: {
          'application/json': {
            description?: string;
            type?: Account['type'];
            active?: boolean;
          };
        };
      };
      responses: { 200: { content: { 'application/json': Account } } };
    };
  };
  '/accounts/{id}/balances': {
    get: {
      parameters: { path: { id: string }; query: { fiscalYearId: string } };
      responses: { 200: { content: { 'application/json': { accountId: string; fiscalYearId: string; balances: AccountBalance[] } } } };
    };
  };
}
