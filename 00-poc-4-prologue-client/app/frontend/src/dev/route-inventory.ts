/**
 * ROUTE_INVENTORY - declarative inventory of every route registered in
 * src/routes.tsx. The /dev/routes page renders this list AND cross-checks
 * it against the router tree to surface drift.
 *
 * Every new route in routes.tsx MUST be added here in the same change.
 */

export interface ConsumedEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  via: 'loader' | 'action' | 'component';
}

export interface RouteInventoryEntry {
  path: string;
  component: string;
  auth: 'public' | 'authed';
  status: 'real' | 'stub';
  consumes: ConsumedEndpoint[];
  notes?: string;
}

export const ROUTE_INVENTORY: RouteInventoryEntry[] = [
  {
    path: '/',
    component: 'NavMenuPage',
    auth: 'authed',
    status: 'real',
    consumes: [{ method: 'GET', path: '/navigation/menu', via: 'component' }],
    notes: 'CI-001 root view; AdminShell side panel uses same endpoint.',
  },
  {
    path: '/gl',
    component: 'NavMenuPage',
    auth: 'authed',
    status: 'real',
    consumes: [{ method: 'GET', path: '/navigation/menu', via: 'component' }],
  },
  {
    path: '/gl/journal-entries',
    component: 'JEListPage',
    auth: 'authed',
    status: 'real',
    consumes: [
      {
        method: 'GET',
        path: '/journal-entries/:journalId/navigation',
        via: 'loader',
      },
    ],
  },
  {
    path: '/gl/journal-entries/new',
    component: 'JEFormPage',
    auth: 'authed',
    status: 'real',
    consumes: [
      { method: 'GET', path: '/reference/companies', via: 'loader' },
      { method: 'GET', path: '/reference/journal-entry-types', via: 'loader' },
      { method: 'POST', path: '/journal-entries', via: 'action' },
    ],
    notes: 'CI-003 create mode',
  },
  {
    path: '/gl/journal-entries/:journalId',
    component: 'JEHeaderPage',
    auth: 'authed',
    status: 'real',
    consumes: [
      { method: 'GET', path: '/journal-entries/:journalId', via: 'loader' },
      {
        method: 'GET',
        path: '/journal-entries/:journalId/navigation',
        via: 'component',
      },
      {
        method: 'POST',
        path: '/journal-entries/:journalId/lines',
        via: 'component',
      },
      {
        method: 'PUT',
        path: '/journal-entries/:journalId/lines/:lineId',
        via: 'component',
      },
      {
        method: 'DELETE',
        path: '/journal-entries/:journalId/lines/:lineId',
        via: 'component',
      },
      { method: 'GET', path: '/accounts/:accountCode', via: 'component' },
      {
        method: 'POST',
        path: '/journal-entries/:journalId/post',
        via: 'action',
      },
    ],
    notes: 'CI-002 + CI-004 + CI-005 + CI-006 + CI-007 composite view',
  },
  {
    path: '/gl/journal-entries/:journalId/edit',
    component: 'JEFormPage',
    auth: 'authed',
    status: 'real',
    consumes: [
      { method: 'GET', path: '/reference/companies', via: 'loader' },
      { method: 'GET', path: '/reference/journal-entry-types', via: 'loader' },
      { method: 'GET', path: '/journal-entries/:journalId', via: 'loader' },
      { method: 'PUT', path: '/journal-entries/:journalId', via: 'action' },
    ],
    notes: 'CI-003 edit mode',
  },
  {
    path: '/gl/reports',
    component: 'ComingSoonPage',
    auth: 'authed',
    status: 'stub',
    consumes: [],
    notes: 'CI-009 deferred stub',
  },
  {
    path: '/gl/trial-balance',
    component: 'ComingSoonPage',
    auth: 'authed',
    status: 'stub',
    consumes: [],
    notes: 'CI-010 deferred stub',
  },
  {
    path: '/ap',
    component: 'ComingSoonPage',
    auth: 'authed',
    status: 'stub',
    consumes: [],
    notes: 'Accounts Payable module - future sprint',
  },
  {
    path: '/companies',
    component: 'CompanySelectPage',
    auth: 'authed',
    status: 'real',
    consumes: [{ method: 'GET', path: '/reference/companies', via: 'component' }],
    notes: 'CI-008 standalone demo',
  },
  {
    path: '/dev/routes',
    component: 'RoutesPage',
    auth: 'public',
    status: 'real',
    consumes: [],
    notes: 'Frontend equivalent of BFF /api-docs',
  },
];
