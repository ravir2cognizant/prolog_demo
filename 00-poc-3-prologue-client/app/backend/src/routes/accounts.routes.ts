import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole, principal } from '../middleware/auth.js';
import {
  SearchAccountsSchema,
  CreateAccountSchema,
  UpdateAccountSchema,
  AccountBalancesSchema,
} from '../domain/schemas.js';
import {
  searchAccounts,
  getAccount,
  createAccount,
  updateAccount,
  getAccountBalances,
} from '../services/accounts.service.js';

const router = Router();

documented({
  tag: 'Accounts',
  method: 'GET',
  path: '/accounts',
  summary: 'Search and list accounts (active filter, code/description search)',
  responses: {
    200: { description: 'Paginated account list' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-administrator']),
  ah(async (req) => {
    const query = SearchAccountsSchema.parse(req.query);
    return searchAccounts(query);
  }),
);

documented({
  tag: 'Accounts',
  method: 'GET',
  path: '/accounts/{id}',
  summary: 'Retrieve a single account by ID',
  responses: {
    200: { description: 'Account object' },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});
router.get(
  '/:id',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-administrator']),
  ah(async (req) => getAccount(req.params['id']!)),
);

documented({
  tag: 'Accounts',
  method: 'POST',
  path: '/accounts',
  summary: 'Create a new general ledger account',
  responses: {
    201: { description: 'Created account' },
    400: { description: 'Validation error or duplicate code' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    409: { description: 'Code already exists' },
  },
});
router.post(
  '/',
  requireRole(['gl-administrator', 'finance-administrator']),
  ah(async (req, res) => {
    const body = CreateAccountSchema.parse(req.body);
    const p = principal(req);
    const acct = createAccount(body, p.sub);
    res.status(201).json(acct);
  }),
);

documented({
  tag: 'Accounts',
  method: 'PUT',
  path: '/accounts/{id}',
  summary: 'Update an existing account',
  responses: {
    200: { description: 'Updated account' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
  },
});
router.put(
  '/:id',
  requireRole(['gl-administrator', 'finance-administrator']),
  ah(async (req) => {
    const body = UpdateAccountSchema.parse(req.body);
    const p = principal(req);
    return updateAccount(req.params['id']!, body, p.sub);
  }),
);

documented({
  tag: 'Accounts',
  method: 'GET',
  path: '/accounts/{id}/balances',
  summary: 'Get account balances per period for a fiscal year',
  responses: {
    200: { description: 'Account balance by period' },
    401: { description: 'Unauthorized' },
    404: { description: 'Account or fiscal year not found' },
  },
});
router.get(
  '/:id/balances',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-administrator', 'finance-reporting-manager']),
  ah(async (req) => {
    const query = AccountBalancesSchema.parse(req.query);
    return getAccountBalances(req.params['id']!, query.fiscalYearId);
  }),
);

export default router;
