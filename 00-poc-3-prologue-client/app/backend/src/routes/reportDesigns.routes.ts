import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole, principal } from '../middleware/auth.js';
import {
  ListReportDesignsSchema,
  SaveReportDesignSchema,
  UpdateReportDesignSchema,
  RunReportSchema,
  ExportReportSchema,
} from '../domain/schemas.js';
import {
  listReportDesigns,
  saveReportDesign,
  updateReportDesign,
  runReportDesign,
  exportReport,
} from '../services/reportDesigns.service.js';

const router = Router();

documented({
  tag: 'Report Designs',
  method: 'GET',
  path: '/report-designs',
  summary: 'List saved report designs with optional name search',
  responses: {
    200: { description: 'Array of report designs' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-manager', 'finance-reporting-manager']),
  ah(async (req) => {
    const query = ListReportDesignsSchema.parse(req.query);
    return listReportDesigns(query.search);
  }),
);

documented({
  tag: 'Report Designs',
  method: 'POST',
  path: '/report-designs',
  summary: 'Save a new report design with row definitions and column periods',
  responses: {
    201: { description: 'Created report design' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    409: { description: 'Name conflict' },
  },
});
router.post(
  '/',
  requireRole(['gl-administrator', 'finance-manager', 'finance-reporting-manager']),
  ah(async (req, res) => {
    const body = SaveReportDesignSchema.parse(req.body);
    const p = principal(req);
    const design = saveReportDesign(body, p.sub);
    res.status(201).json(design);
  }),
);

documented({
  tag: 'Report Designs',
  method: 'PUT',
  path: '/report-designs/{id}',
  summary: 'Update an existing report design',
  responses: {
    200: { description: 'Updated report design' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
  },
});
router.put(
  '/:id',
  requireRole(['gl-administrator', 'finance-manager', 'finance-reporting-manager']),
  ah(async (req) => {
    const body = UpdateReportDesignSchema.parse(req.body);
    const p = principal(req);
    return updateReportDesign(req.params['id']!, body, p.sub);
  }),
);

documented({
  tag: 'Report Designs',
  method: 'POST',
  path: '/report-designs/{id}/run',
  summary: 'Execute a report design and return computed row/column data',
  responses: {
    200: { description: 'Report result with computed balances per row/period' },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});
router.post(
  '/:id/run',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-manager', 'finance-reporting-manager']),
  ah(async (req) => {
    const body = RunReportSchema.parse(req.body);
    return runReportDesign(req.params['id']!, body.dataSourceType);
  }),
);

documented({
  tag: 'Report Designs',
  method: 'GET',
  path: '/report-designs/{id}/export',
  summary: 'Export a report design as PDF or XLSX file',
  responses: {
    200: { description: 'File download' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});
router.get(
  '/:id/export',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-manager', 'finance-reporting-manager']),
  ah(async (req, res) => {
    const query = ExportReportSchema.parse(req.query);
    const result = exportReport(req.params['id']!, query.format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  }),
);

export default router;
