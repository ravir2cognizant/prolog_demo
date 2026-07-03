import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole, principal } from '../middleware/auth.js';
import {
  ListAllocationRulesSchema,
  CreateAllocationRuleSchema,
  UpdateAllocationRuleSchema,
  RunAllocationSchema,
} from '../domain/schemas.js';
import {
  listAllocationRules,
  createAllocationRule,
  updateAllocationRule,
  deleteAllocationRule,
  runAllocationRule,
} from '../services/allocationRules.service.js';

const router = Router();

documented({
  tag: 'Allocation Rules',
  method: 'GET',
  path: '/allocation-rules',
  summary: 'List allocation rules with optional company filter',
  responses: {
    200: { description: 'Array of allocation rules' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-manager']),
  ah(async (req) => {
    const query = ListAllocationRulesSchema.parse(req.query);
    return listAllocationRules(query);
  }),
);

documented({
  tag: 'Allocation Rules',
  method: 'POST',
  path: '/allocation-rules',
  summary: 'Create a new allocation rule',
  responses: {
    201: { description: 'Created allocation rule' },
    400: { description: 'Validation error or percentages do not sum to 100' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});
router.post(
  '/',
  requireRole(['gl-administrator', 'finance-manager']),
  ah(async (req, res) => {
    const body = CreateAllocationRuleSchema.parse(req.body);
    const p = principal(req);
    const rule = createAllocationRule(body, p.sub);
    res.status(201).json(rule);
  }),
);

documented({
  tag: 'Allocation Rules',
  method: 'PUT',
  path: '/allocation-rules/{id}',
  summary: 'Update an existing allocation rule',
  responses: {
    200: { description: 'Updated allocation rule' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
  },
});
router.put(
  '/:id',
  requireRole(['gl-administrator', 'finance-manager']),
  ah(async (req) => {
    const body = UpdateAllocationRuleSchema.parse(req.body);
    const p = principal(req);
    return updateAllocationRule(req.params['id']!, body, p.sub);
  }),
);

documented({
  tag: 'Allocation Rules',
  method: 'DELETE',
  path: '/allocation-rules/{id}',
  summary: 'Delete an allocation rule (not referenced by journal entries)',
  responses: {
    200: { description: 'Deletion confirmation' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    409: { description: 'Rule is in use' },
  },
});
router.delete(
  '/:id',
  requireRole(['gl-administrator', 'finance-manager']),
  ah(async (req) => deleteAllocationRule(req.params['id']!)),
);

documented({
  tag: 'Allocation Rules',
  method: 'POST',
  path: '/allocation-rules/{id}/run',
  summary: 'Execute an allocation rule for a fiscal period',
  responses: {
    200: { description: 'Allocation run result with generated entry IDs' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Rule, fiscal year, or period not found' },
    422: { description: 'Period is closed' },
  },
});
router.post(
  '/:id/run',
  requireRole(['gl-supervisor', 'gl-administrator', 'finance-manager']),
  ah(async (req) => {
    const body = RunAllocationSchema.parse(req.body);
    const p = principal(req);
    return runAllocationRule(req.params['id']!, body, p.sub);
  }),
);

export default router;
