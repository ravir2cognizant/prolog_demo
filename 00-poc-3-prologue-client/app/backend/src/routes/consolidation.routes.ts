import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole, principal } from '../middleware/auth.js';
import {
  AddConsolidationSourceSchema,
  RunConsolidationSchema,
  ListConsolidationRunsSchema,
} from '../domain/schemas.js';
import {
  listConsolidationSources,
  addConsolidationSource,
  runConsolidation,
  listConsolidationRuns,
  getConsolidationRunReport,
} from '../services/consolidation.service.js';

const router = Router();

documented({
  tag: 'Consolidation',
  method: 'GET',
  path: '/consolidation/sources',
  summary: 'List registered consolidation data sources',
  responses: {
    200: { description: 'List of consolidation sources' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/sources',
  requireRole(['gl-administrator', 'finance-administrator', 'group-finance-manager']),
  ah(async () => listConsolidationSources()),
);

documented({
  tag: 'Consolidation',
  method: 'POST',
  path: '/consolidation/sources',
  summary: 'Register a new consolidation data source',
  responses: {
    201: { description: 'Created consolidation source' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});
router.post(
  '/sources',
  requireRole(['gl-administrator', 'finance-administrator', 'group-finance-manager']),
  ah(async (req, res) => {
    const body = AddConsolidationSourceSchema.parse(req.body);
    const p = principal(req);
    const src = addConsolidationSource(body, p.sub);
    res.status(201).json(src);
  }),
);

documented({
  tag: 'Consolidation',
  method: 'POST',
  path: '/consolidation/run',
  summary: 'Execute a consolidation run for a fiscal year',
  responses: {
    200: { description: 'Consolidation run result' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    409: { description: 'Run already in progress' },
  },
});
router.post(
  '/run',
  requireRole(['gl-administrator', 'group-finance-manager']),
  ah(async (req) => {
    const body = RunConsolidationSchema.parse(req.body);
    const p = principal(req);
    return runConsolidation(body, p.sub);
  }),
);

documented({
  tag: 'Consolidation',
  method: 'GET',
  path: '/consolidation/runs',
  summary: 'List past consolidation runs (newest first, paginated)',
  responses: {
    200: { description: 'Paginated list of consolidation runs' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/runs',
  requireRole(['gl-administrator', 'finance-administrator', 'group-finance-manager', 'finance-reporting-manager']),
  ah(async (req) => {
    const query = ListConsolidationRunsSchema.parse(req.query);
    return listConsolidationRuns(query.page, query.pageSize);
  }),
);

documented({
  tag: 'Consolidation',
  method: 'GET',
  path: '/consolidation/runs/{id}/report',
  summary: 'Get the detailed report for a consolidation run',
  responses: {
    200: { description: 'Consolidation run report with per-source results' },
    401: { description: 'Unauthorized' },
    404: { description: 'Run not found' },
  },
});
router.get(
  '/runs/:id/report',
  requireRole(['gl-administrator', 'finance-administrator', 'group-finance-manager', 'finance-reporting-manager']),
  ah(async (req) => getConsolidationRunReport(req.params['id']!)),
);

export default router;
