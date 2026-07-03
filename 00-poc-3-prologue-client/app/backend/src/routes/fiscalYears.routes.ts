import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole, principal } from '../middleware/auth.js';
import {
  ListFiscalYearsSchema,
  CreateFiscalYearSchema,
} from '../domain/schemas.js';
import {
  listFiscalYears,
  createFiscalYear,
  listPeriods,
  openPeriod,
  closePeriod,
  yearEndClose,
} from '../services/fiscalYears.service.js';

const router = Router();

documented({
  tag: 'Fiscal Years',
  method: 'GET',
  path: '/fiscal-years',
  summary: 'List fiscal years with optional company filter',
  responses: {
    200: { description: 'Array of fiscal years' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-administrator', 'finance-manager']),
  ah(async (req) => {
    const query = ListFiscalYearsSchema.parse(req.query);
    return listFiscalYears(query.companyId);
  }),
);

documented({
  tag: 'Fiscal Years',
  method: 'POST',
  path: '/fiscal-years',
  summary: 'Create a new fiscal year and auto-generate monthly periods',
  responses: {
    201: { description: 'Created fiscal year with periods' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    409: { description: 'Fiscal year already exists for this company/year' },
  },
});
router.post(
  '/',
  requireRole(['gl-administrator', 'finance-administrator']),
  ah(async (req, res) => {
    const body = CreateFiscalYearSchema.parse(req.body);
    const p = principal(req);
    const fy = createFiscalYear(body, p.sub);
    res.status(201).json(fy);
  }),
);

documented({
  tag: 'Fiscal Years',
  method: 'GET',
  path: '/fiscal-years/{id}/periods',
  summary: 'List periods for a fiscal year',
  responses: {
    200: { description: 'Array of periods in sequence order' },
    401: { description: 'Unauthorized' },
    404: { description: 'Fiscal year not found' },
  },
});
router.get(
  '/:id/periods',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-administrator', 'finance-manager']),
  ah(async (req) => listPeriods(req.params['id']!)),
);

documented({
  tag: 'Fiscal Years',
  method: 'PUT',
  path: '/fiscal-years/{id}/periods/{periodId}/open',
  summary: 'Re-open a closed accounting period',
  responses: {
    200: { description: 'Period status: Open' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Fiscal year or period not found' },
    409: { description: 'Period already open' },
    422: { description: 'Fiscal year is closed' },
  },
});
router.put(
  '/:id/periods/:periodId/open',
  requireRole(['gl-administrator', 'finance-administrator']),
  ah(async (req) => openPeriod(req.params['id']!, req.params['periodId']!)),
);

documented({
  tag: 'Fiscal Years',
  method: 'PUT',
  path: '/fiscal-years/{id}/periods/{periodId}/close',
  summary: 'Close an open accounting period',
  responses: {
    200: { description: 'Period status: Closed' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Fiscal year or period not found' },
    409: { description: 'Period already closed' },
  },
});
router.put(
  '/:id/periods/:periodId/close',
  requireRole(['gl-administrator', 'finance-administrator']),
  ah(async (req) => closePeriod(req.params['id']!, req.params['periodId']!)),
);

documented({
  tag: 'Fiscal Years',
  method: 'POST',
  path: '/fiscal-years/{id}/year-end-close',
  summary: 'Execute year-end close: validates no unposted entries, carries forward balances',
  responses: {
    200: { description: 'Year-end close result' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Fiscal year not found' },
    422: { description: 'Unposted entries exist or year already closed' },
  },
});
router.post(
  '/:id/year-end-close',
  requireRole(['gl-administrator', 'finance-administrator']),
  ah(async (req) => {
    const p = principal(req);
    return yearEndClose(req.params['id']!, p.sub);
  }),
);

export default router;
