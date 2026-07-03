import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole, principal } from '../middleware/auth.js';
import {
  GetBudgetsSchema,
  UpdateBudgetsSchema,
  ExportBudgetsSchema,
} from '../domain/schemas.js';
import {
  getBudgets,
  updateBudgets,
  importBudgets,
  exportBudgets,
} from '../services/budgets.service.js';

const router = Router();

documented({
  tag: 'Budgets',
  method: 'GET',
  path: '/budgets',
  summary: 'Get budget grid for a company and fiscal year',
  responses: {
    200: { description: 'Budget rows with period amounts' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-manager', 'finance-administrator']),
  ah(async (req) => {
    const query = GetBudgetsSchema.parse(req.query);
    return getBudgets(query.companyId, query.fiscalYear);
  }),
);

documented({
  tag: 'Budgets',
  method: 'PUT',
  path: '/budgets',
  summary: 'Update budget amounts for account/period cells',
  responses: {
    200: { description: 'Update confirmation with count' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});
router.put(
  '/',
  requireRole(['gl-administrator', 'finance-manager', 'finance-administrator']),
  ah(async (req) => {
    const body = UpdateBudgetsSchema.parse(req.body);
    return updateBudgets(body);
  }),
);

documented({
  tag: 'Budgets',
  method: 'POST',
  path: '/budgets/import',
  summary: 'Import budget amounts from uploaded file (CSV/XLSX)',
  responses: {
    200: { description: 'Import result with imported/error counts' },
    400: { description: 'Missing or invalid file' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});
router.post(
  '/import',
  requireRole(['gl-administrator', 'finance-manager', 'finance-administrator']),
  ah(async (req) => {
    const companyId = String(req.query['companyId'] ?? '');
    const fiscalYear = Number(req.query['fiscalYear'] ?? 0);
    const fileBuffer = Buffer.from('');
    return importBudgets(companyId, fiscalYear, fileBuffer);
  }),
);

documented({
  tag: 'Budgets',
  method: 'GET',
  path: '/budgets/export',
  summary: 'Export budget grid as CSV or XLSX file download',
  responses: {
    200: { description: 'File download' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/export',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-manager', 'finance-administrator', 'finance-reporting-manager']),
  ah(async (req, res) => {
    const query = ExportBudgetsSchema.parse(req.query);
    const result = exportBudgets(query.companyId, query.fiscalYear, query.format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  }),
);

export default router;
