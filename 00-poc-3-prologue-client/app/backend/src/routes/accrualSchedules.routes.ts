import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole, principal } from '../middleware/auth.js';
import {
  ListAccrualsSchema,
  CreateAccrualSchema,
  UpdateAccrualSchema,
} from '../domain/schemas.js';
import {
  listAccrualSchedules,
  createAccrualSchedule,
  updateAccrualSchedule,
  cancelAccrualSchedule,
  listScheduleEntries,
} from '../services/accrualSchedules.service.js';

const router = Router();

documented({
  tag: 'Accrual Schedules',
  method: 'GET',
  path: '/accrual-schedules',
  summary: 'List accrual schedules with optional company and status filters',
  responses: {
    200: { description: 'Paginated accrual schedule list' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-manager']),
  ah(async (req) => {
    const query = ListAccrualsSchema.parse(req.query);
    return listAccrualSchedules(query);
  }),
);

documented({
  tag: 'Accrual Schedules',
  method: 'POST',
  path: '/accrual-schedules',
  summary: 'Create a new accrual schedule',
  responses: {
    201: { description: 'Created accrual schedule' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});
router.post(
  '/',
  requireRole(['gl-administrator', 'finance-manager']),
  ah(async (req, res) => {
    const body = CreateAccrualSchema.parse(req.body);
    const p = principal(req);
    const schedule = createAccrualSchedule(body, p.sub);
    res.status(201).json(schedule);
  }),
);

documented({
  tag: 'Accrual Schedules',
  method: 'PUT',
  path: '/accrual-schedules/{id}',
  summary: 'Update an accrual schedule (not Cancelled)',
  responses: {
    200: { description: 'Updated accrual schedule' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    422: { description: 'Schedule is cancelled' },
  },
});
router.put(
  '/:id',
  requireRole(['gl-administrator', 'finance-manager']),
  ah(async (req) => {
    const body = UpdateAccrualSchema.parse(req.body);
    const p = principal(req);
    return updateAccrualSchedule(req.params['id']!, body, p.sub);
  }),
);

documented({
  tag: 'Accrual Schedules',
  method: 'DELETE',
  path: '/accrual-schedules/{id}',
  summary: 'Cancel an accrual schedule',
  responses: {
    200: { description: 'Cancellation confirmation' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    409: { description: 'Already cancelled' },
  },
});
router.delete(
  '/:id',
  requireRole(['gl-administrator', 'finance-manager']),
  ah(async (req) => {
    return cancelAccrualSchedule(req.params['id']!);
  }),
);

documented({
  tag: 'Accrual Schedules',
  method: 'GET',
  path: '/accrual-schedules/{id}/entries',
  summary: 'List generated journal entries for an accrual schedule',
  responses: {
    200: { description: 'List of accrual schedule entries' },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});
router.get(
  '/:id/entries',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-manager']),
  ah(async (req) => listScheduleEntries(req.params['id']!)),
);

export default router;
