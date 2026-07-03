import type {
  Account,
  Company,
  JournalEntry,
  JournalEntryType,
  LineItem,
  NavItem,
} from '../domain/types.js';
import { makeCounter } from '../util/ids.js';

/**
 * In-memory data store. Each domain is a Map<id, T>. Lines are keyed by lineId
 * and carry their parent journalId so navigation and totals can be derived.
 *
 * No persistence: state lives only for the lifetime of the Node process.
 */
export interface StoreState {
  companies: Map<string, Company>;
  journalEntryTypes: Map<string, JournalEntryType>;
  accounts: Map<string, Account>;
  navItems: NavItem[];
  journalEntries: Map<number, JournalEntry>;
  lineItems: Map<number, LineItem & { journalId: number }>;
  // Per-journal line-number counters keep the auto-assigned lineNumber
  // monotonic even after deletions (TC-BFF-022 relies on sequential output).
  lineNumberCounters: Map<number, () => number>;
  nextJournalId: () => number;
  nextJournalNumber: () => number;
  nextLineId: () => number;
}

function freshState(): StoreState {
  return {
    companies: new Map(),
    journalEntryTypes: new Map(),
    accounts: new Map(),
    navItems: [],
    journalEntries: new Map(),
    lineItems: new Map(),
    lineNumberCounters: new Map(),
    nextJournalId: makeCounter(1),
    nextJournalNumber: makeCounter(1001),
    nextLineId: makeCounter(1),
  };
}

let state: StoreState = freshState();

export const memoryStore = {
  get: (): StoreState => state,
  /**
   * Reset and re-seed for tests. Production callers MUST NOT touch this.
   */
  reset: (): void => {
    state = freshState();
  },
};
