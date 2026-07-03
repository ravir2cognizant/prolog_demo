import { Router } from 'express';
import { documented } from '../docs/registry.js';
import { ah } from '../controllers/asyncHandler.js';
import { requireRole } from '../middleware/auth.js';
import { principal } from '../middleware/auth.js';
import {
  CreateJESchema,
  UpdateJESchema,
  ListJESchema,
  ExportJESchema,
  ReverseSchema,
  RejectSchema,
} from '../domain/schemas.js';
import {
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  listJournalEntries,
  postJournalEntry,
  unpostJournalEntry,
  reverseJournalEntry,
  submitForApproval,
  approveJournalEntry,
  rejectJournalEntry,
  exportJournalEntries,
} from '../services/journalEntries.service.js';

const router = Router();

documented({
  tag: 'Journal Entries',
  method: 'GET',
  path: '/journal-entries',
  summary: 'List and navigate journal entries with cursor pagination',
  responses: {
    200: { description: 'Paginated journal entry list with cursor tokens' },
    400: { description: 'Invalid query parameters' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
});
router.get(
  '/',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator']),
  ah(async (req) => {
    const query = ListJESchema.parse(req.query);
    return listJournalEntries(query);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'GET',
  path: '/journal-entries/export',
  summary: 'Export posted journal entries as CSV or XLSX',
  responses: {
    200: { description: 'File download (text/csv or xlsx)' },
    400: { description: 'Invalid parameters' },
    401: { description: 'Unauthorized' },
  },
});
router.get(
  '/export',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator', 'finance-reporting-manager']),
  ah(async (req, res) => {
    const query = ExportJESchema.parse(req.query);
    const csv = exportJournalEntries(query);
    const ext = query.format === 'xlsx' ? 'xlsx' : 'csv';
    const contentType = query.format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="journal-entries-${query.companyId}.${ext}"`);
    res.send(csv);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'GET',
  path: '/journal-entries/{id}',
  summary: 'Retrieve a single journal entry by ID',
  responses: {
    200: { description: 'Journal entry object' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
  },
});
router.get(
  '/:id',
  requireRole(['gl-accountant', 'gl-supervisor', 'gl-administrator']),
  ah(async (req) => getJournalEntry(req.params['id']!)),
);

documented({
  tag: 'Journal Entries',
  method: 'POST',
  path: '/journal-entries',
  summary: 'Create a new journal entry (Unposted)',
  responses: {
    200: { description: 'Created journal entry summary' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    422: { description: 'Period closed' },
  },
});
router.post(
  '/',
  requireRole(['gl-accountant', 'gl-administrator']),
  ah(async (req) => {
    const body = CreateJESchema.parse(req.body);
    const p = principal(req);
    return createJournalEntry(body, p.sub);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'PUT',
  path: '/journal-entries/{id}',
  summary: 'Update journal entry header and lines (Unposted only)',
  responses: {
    200: { description: 'Updated journal entry summary' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    409: { description: 'Entry already posted' },
    422: { description: 'Period closed' },
  },
});
router.put(
  '/:id',
  requireRole(['gl-accountant', 'gl-administrator']),
  ah(async (req) => {
    const body = UpdateJESchema.parse(req.body);
    const p = principal(req);
    return updateJournalEntry(req.params['id']!, body, p.sub);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'POST',
  path: '/journal-entries/{id}/post',
  summary: 'Post a balanced Unposted journal entry',
  responses: {
    200: { description: 'Entry status: Posted' },
    400: { description: 'Entry not balanced' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    409: { description: 'Already posted or pending approval' },
    422: { description: 'Period closed' },
  },
});
router.post(
  '/:id/post',
  requireRole(['gl-supervisor', 'gl-administrator']),
  ah(async (req) => {
    const p = principal(req);
    return postJournalEntry(req.params['id']!, p.sub);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'POST',
  path: '/journal-entries/{id}/unpost',
  summary: 'Revert a Posted journal entry to Unposted',
  responses: {
    200: { description: 'Entry status: Unposted' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    409: { description: 'Entry already unposted' },
    422: { description: 'Period closed' },
  },
});
router.post(
  '/:id/unpost',
  requireRole(['gl-supervisor', 'gl-administrator']),
  ah(async (req) => {
    const p = principal(req);
    return unpostJournalEntry(req.params['id']!, p.sub);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'POST',
  path: '/journal-entries/{id}/reverse',
  summary: 'Create a reversal journal entry',
  responses: {
    200: { description: 'Newly created reversal entry' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    422: { description: 'Entry not posted or period closed' },
  },
});
router.post(
  '/:id/reverse',
  requireRole(['gl-supervisor', 'gl-administrator']),
  ah(async (req) => {
    const body = ReverseSchema.parse(req.body);
    const p = principal(req);
    return reverseJournalEntry(req.params['id']!, body.reversalDate, p.sub);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'POST',
  path: '/journal-entries/{id}/submit-for-approval',
  summary: 'Submit an Unposted entry for routing approval',
  responses: {
    200: { description: 'Entry submitted for approval' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    422: { description: 'Already submitted or routing not set' },
  },
});
router.post(
  '/:id/submit-for-approval',
  requireRole(['gl-accountant', 'gl-administrator']),
  ah(async (req) => {
    const p = principal(req);
    return submitForApproval(req.params['id']!, p.sub);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'POST',
  path: '/journal-entries/{id}/approve',
  summary: 'Approve a journal entry pending routing approval',
  responses: {
    200: { description: 'Entry approved' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    422: { description: 'Entry not pending approval' },
  },
});
router.post(
  '/:id/approve',
  requireRole(['gl-supervisor', 'finance-manager', 'gl-administrator']),
  ah(async (req) => {
    const p = principal(req);
    return approveJournalEntry(req.params['id']!, p.sub);
  }),
);

documented({
  tag: 'Journal Entries',
  method: 'POST',
  path: '/journal-entries/{id}/reject',
  summary: 'Reject a journal entry pending routing approval',
  responses: {
    200: { description: 'Entry rejected' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
    422: { description: 'Entry not pending approval' },
  },
});
router.post(
  '/:id/reject',
  requireRole(['gl-supervisor', 'finance-manager', 'gl-administrator']),
  ah(async (req) => {
    const body = RejectSchema.parse(req.body);
    const p = principal(req);
    return rejectJournalEntry(req.params['id']!, body.rejectionReason, p.sub);
  }),
);

export default router;
