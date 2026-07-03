/**
 * apiClient - typed wrapper around openapi-fetch.
 *
 * Because the BFF does not yet emit a machine-readable OpenAPI schema we
 * keep the openapi-fetch generic loose and provide typed wrapper methods
 * around it. The wire-contract types come from ./types.ts (which mirror
 * the BFF domain types).
 *
 * Rules:
 *  - The only raw fetch in this codebase is the MSW worker bootstrap.
 *    All BFF reads/writes MUST go through this module.
 *  - VITE_API_BASE_URL defaults to http://localhost:4000.
 *  - VITE_DEV_TOKEN is injected as `Authorization: Bearer <token>`.
 */
import createClient from 'openapi-fetch';
import type {
  Account,
  Company,
  CreateJournalEntryRequest,
  CreateJournalEntryResponse,
  CreateLineItemRequest,
  JournalEntryFull,
  JournalEntryType,
  LineItem,
  NavItem,
  NavigationContext,
  PostJournalEntryResponse,
  UpdateJournalEntryRequest,
  UpdateJournalEntryResponse,
  UpdateLineItemRequest,
} from './types';

const baseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:4000';
const devToken = (import.meta.env.VITE_DEV_TOKEN as string | undefined) ?? '';

/**
 * Loose-typed paths object satisfies openapi-fetch's generic without an
 * actual OpenAPI schema. Each wrapper method below cast-narrows the
 * response body to the canonical domain type.
 */
type LoosePaths = Record<string, Record<string, unknown>>;
const rawClient = createClient<LoosePaths>({
  baseUrl,
  headers: devToken ? { Authorization: `Bearer ${devToken}` } : {},
});

interface FetchResponse {
  data?: unknown;
  error?: unknown;
  response: Response;
}

async function unwrap<T>(promise: Promise<FetchResponse>): Promise<T> {
  const result = await promise;
  if (!result.response.ok) {
    const message =
      (result.error as { error?: string } | undefined)?.error ??
      `HTTP ${result.response.status}`;
    throw new Error(message);
  }
  return result.data as T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ApiClient {
  getNavigationMenu(): Promise<{ items: NavItem[] }>;
  getJournalEntry(journalId: number): Promise<JournalEntryFull>;
  createJournalEntry(
    body: CreateJournalEntryRequest,
  ): Promise<CreateJournalEntryResponse>;
  updateJournalEntry(
    journalId: number,
    body: UpdateJournalEntryRequest,
  ): Promise<UpdateJournalEntryResponse>;
  postJournalEntry(journalId: number): Promise<PostJournalEntryResponse>;
  listLines(journalId: number): Promise<{ journalId: number; lines: LineItem[] }>;
  createLine(journalId: number, body: CreateLineItemRequest): Promise<LineItem>;
  updateLine(
    journalId: number,
    lineId: number,
    body: UpdateLineItemRequest,
  ): Promise<LineItem>;
  deleteLine(journalId: number, lineId: number): Promise<void>;
  getAccount(accountCode: string): Promise<Account>;
  getCompanies(): Promise<{ companies: Company[] }>;
  getJournalEntryTypes(): Promise<{ types: JournalEntryType[] }>;
  getNavigationContext(
    journalId: number,
    query?: { sortField?: string; sortOrder?: string; companyId?: string },
  ): Promise<NavigationContext>;
}

export const apiClient: ApiClient = {
  getNavigationMenu: () =>
    unwrap<{ items: NavItem[] }>(
      (rawClient as any).GET('/navigation/menu', {}),
    ),

  getJournalEntry: (journalId) =>
    unwrap<JournalEntryFull>(
      (rawClient as any).GET(`/journal-entries/${journalId}`, {}),
    ),

  createJournalEntry: (body) =>
    unwrap<CreateJournalEntryResponse>(
      (rawClient as any).POST('/journal-entries', { body }),
    ),

  updateJournalEntry: (journalId, body) =>
    unwrap<UpdateJournalEntryResponse>(
      (rawClient as any).PUT(`/journal-entries/${journalId}`, { body }),
    ),

  postJournalEntry: (journalId) =>
    unwrap<PostJournalEntryResponse>(
      (rawClient as any).POST(`/journal-entries/${journalId}/post`, {}),
    ),

  listLines: (journalId) =>
    unwrap<{ journalId: number; lines: LineItem[] }>(
      (rawClient as any).GET(`/journal-entries/${journalId}/lines`, {}),
    ),

  createLine: (journalId, body) =>
    unwrap<LineItem>(
      (rawClient as any).POST(`/journal-entries/${journalId}/lines`, { body }),
    ),

  updateLine: (journalId, lineId, body) =>
    unwrap<LineItem>(
      (rawClient as any).PUT(
        `/journal-entries/${journalId}/lines/${lineId}`,
        { body },
      ),
    ),

  deleteLine: (journalId, lineId) =>
    unwrap<void>(
      (rawClient as any).DELETE(
        `/journal-entries/${journalId}/lines/${lineId}`,
        {},
      ),
    ),

  getAccount: (accountCode) =>
    unwrap<Account>(
      (rawClient as any).GET(
        `/accounts/${encodeURIComponent(accountCode)}`,
        {},
      ),
    ),

  getCompanies: () =>
    unwrap<{ companies: Company[] }>(
      (rawClient as any).GET('/reference/companies', {}),
    ),

  getJournalEntryTypes: () =>
    unwrap<{ types: JournalEntryType[] }>(
      (rawClient as any).GET('/reference/journal-entry-types', {}),
    ),

  getNavigationContext: (journalId, query) => {
    const params = new URLSearchParams();
    if (query?.sortField) params.set('sortField', query.sortField);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);
    if (query?.companyId) params.set('companyId', query.companyId);
    const qs = params.toString();
    const path = qs
      ? `/journal-entries/${journalId}/navigation?${qs}`
      : `/journal-entries/${journalId}/navigation`;
    return unwrap<NavigationContext>((rawClient as any).GET(path, {}));
  },
};

/* eslint-enable @typescript-eslint/no-explicit-any */
