import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole, principal } from '../middleware/auth.js';
import {
  ListImportErrorsSchema,
  ExportTransactionsSchema,
} from '../domain/schemas.js';
import {
  submitImportJob,
  getImportJobStatus,
  getImportErrors,
  exportTransactions,
} from '../services/transactions.service.js';

const router = Router();

documented({
  tag: 'Transactions',
  method: 'POST',
  path: '/transactions/import',
  summary: 'Submit a transaction file import job (async, returns 202)',
  responses: {
    202: { description: 'Import job accepted; poll status endpoint for progress' },
    400: { description: 'Validation error or missing file' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});
router.post(
  '/import',
  requireRole(['gl-administrator', 'finance-administrator']),
  ah(async (req, res) => {
    const companyId = String(req.body?.companyId ?? req.query['companyId'] ?? '');
    const p = principal(req);
    const job = submitImportJob(companyId, p.sub);
    res.status(202).json(job);
  }),
);

documented({
  tag: 'Transactions',
  method: 'GET',
  path: '/transactions/import/{jobId}/status',
  summary: 'Poll the status of a transaction import job',
  responses: {
    200: { description: 'Import job status object' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden (not your job)' },
    404: { description: 'Job not found' },
  },
});
router.get(
  '/import/:jobId/status',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-administrator']),
  ah(async (req) => {
    const p = principal(req);
    return getImportJobStatus(req.params['jobId']!, p.sub);
  }),
);

documented({
  tag: 'Transactions',
  method: 'GET',
  path: '/transactions/import/{jobId}/errors',
  summary: 'Retrieve paginated error list for a completed import job',
  responses: {
    200: { description: 'Paginated import errors' },
    400: { description: 'Job not yet complete' },
    401: { description: 'Unauthorized' },
    404: { description: 'Job not found' },
  },
});
router.get(
  '/import/:jobId/errors',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-administrator']),
  ah(async (req) => {
    const query = ListImportErrorsSchema.parse(req.query);
    return getImportErrors(req.params['jobId']!, query.page, query.pageSize);
  }),
);

documented({
  tag: 'Transactions',
  method: 'GET',
  path: '/transactions/export',
  summary: 'Export posted transactions for a company and date range',
  responses: {
    200: { description: 'File download (CSV or XLSX)' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/export',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-reporting-manager']),
  ah(async (req, res) => {
    const query = ExportTransactionsSchema.parse(req.query);
    const result = exportTransactions(query);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  }),
);

export default router;
