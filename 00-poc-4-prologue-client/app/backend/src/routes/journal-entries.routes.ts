import { Router } from 'express';
import { z } from 'zod';
import { ah } from '../controllers/asyncHandler.js';
import { documented } from '../docs/registry.js';
import {
  conflict,
  forbidden,
  notFound,
  serverError,
  unauthorised,
  validationFailure,
} from '../docs/responses.js';
import { principal } from '../middleware/auth.js';
import {
  CreateJournalEntryBody,
  CreateLineItemBody,
  JournalIdLineIdParam,
  JournalIdParam,
  NavigationQuery,
  UpdateJournalEntryBodyLenient,
  UpdateLineItemBody,
} from '../domain/schemas.js';
import {
  createJournalEntry,
  getJournalEntry,
  getNavigationContext,
  postJournalEntry,
  updateJournalEntry,
} from '../services/journal-entry.service.js';
import {
  createLine,
  deleteLine,
  listLines,
  updateLine,
} from '../services/line-item.service.js';

// ---- Response schemas (for /api-docs) -------------------------------------

const LineItemSchema = z.object({
  lineId: z.number(),
  lineNumber: z.number(),
  accountCode: z.string(),
  accountDescription: z.string(),
  currencyId: z.string(),
  debitAmount: z.number(),
  creditAmount: z.number(),
  description: z.string(),
  referenceNumber: z.string(),
});

const JournalTotalsSchema = z.object({
  totalDebits: z.number(),
  totalCredits: z.number(),
  difference: z.number(),
});

const JournalEntryFullResponse = z.object({
  journalId: z.number(),
  companyId: z.string(),
  companyName: z.string(),
  journalEntryType: z.string(),
  journalNumber: z.number(),
  status: z.enum(['Unposted', 'Posted']),
  transactionDate: z.string(),
  editDateTime: z.string(),
  editUserId: z.string(),
  autoReversalDate: z.string().nullable(),
  description: z.string(),
  postingSession: z.string().nullable(),
  sourceDocument: z.string().nullable(),
  glImport: z.string().nullable(),
  allocationMethodId: z.string().nullable(),
  balanced: z.boolean(),
  postedDateTime: z.string().nullable(),
  posterUserId: z.string().nullable(),
  lines: z.array(LineItemSchema),
  totals: JournalTotalsSchema,
});

const CreateJournalEntryResponse = z.object({
  journalId: z.number(),
  journalNumber: z.number(),
  status: z.literal('Unposted'),
  editDateTime: z.string(),
  editUserId: z.string(),
});

const UpdateJournalEntryResponse = z.object({
  journalId: z.number(),
  editDateTime: z.string(),
  editUserId: z.string(),
});

const PostJournalEntryResponse = z.object({
  journalId: z.number(),
  status: z.literal('Posted'),
  postedDateTime: z.string(),
  posterUserId: z.string(),
});

const LinesResponse = z.object({
  journalId: z.number(),
  lines: z.array(LineItemSchema),
});

const NavigationContextResponse = z.object({
  currentJournalId: z.number(),
  firstJournalId: z.number().nullable(),
  previousJournalId: z.number().nullable(),
  nextJournalId: z.number().nullable(),
  lastJournalId: z.number().nullable(),
  isFirst: z.boolean(),
  isLast: z.boolean(),
  totalCount: z.number(),
});

export const journalEntriesRouter = Router();

// ---- ED-002 GET /journal-entries/:journalId -------------------------------

documented({
  method: 'get',
  path: '/journal-entries/:journalId',
  tag: 'journal-entries',
  summary: 'ED-002: Get journal entry header + lines + totals',
  auth: 'bearer',
  pathParams: { journalId: { description: 'Positive integer journal identifier' } },
  responses: {
    200: { description: 'Journal entry', schema: JournalEntryFullResponse },
    400: validationFailure,
    401: unauthorised,
    404: notFound,
    500: serverError,
  },
});

journalEntriesRouter.get(
  '/journal-entries/:journalId',
  ah((req) => {
    const { journalId } = JournalIdParam.parse(req.params);
    return getJournalEntry(journalId);
  }),
);

// ---- ED-003 POST /journal-entries -----------------------------------------

documented({
  method: 'post',
  path: '/journal-entries',
  tag: 'journal-entries',
  summary: 'ED-003: Create a new journal entry (status: Unposted)',
  auth: 'bearer',
  requestBody: CreateJournalEntryBody,
  responses: {
    201: { description: 'Journal entry created', schema: CreateJournalEntryResponse },
    400: validationFailure,
    401: unauthorised,
    500: serverError,
  },
});

journalEntriesRouter.post(
  '/journal-entries',
  ah((req, res) => {
    const body = CreateJournalEntryBody.parse(req.body);
    const result = createJournalEntry(body, principal(req));
    res.status(201);
    return result;
  }),
);

// ---- ED-003 PUT /journal-entries/:journalId -------------------------------

documented({
  method: 'put',
  path: '/journal-entries/:journalId',
  tag: 'journal-entries',
  summary: 'ED-003: Update journal entry header (Unposted only; companyId locked)',
  auth: 'bearer',
  pathParams: { journalId: { description: 'Positive integer journal identifier' } },
  requestBody: UpdateJournalEntryBodyLenient,
  responses: {
    200: { description: 'Journal entry updated', schema: UpdateJournalEntryResponse },
    400: validationFailure,
    401: unauthorised,
    403: forbidden,
    404: notFound,
    500: serverError,
  },
});

journalEntriesRouter.put(
  '/journal-entries/:journalId',
  ah((req) => {
    const { journalId } = JournalIdParam.parse(req.params);
    const body = UpdateJournalEntryBodyLenient.parse(req.body);
    return updateJournalEntry(journalId, body, principal(req));
  }),
);

// ---- ED-006 POST /journal-entries/:journalId/post -------------------------

documented({
  method: 'post',
  path: '/journal-entries/:journalId/post',
  tag: 'journal-entries',
  summary: 'ED-006: Post a balanced journal entry (Unposted -> Posted)',
  auth: 'bearer',
  pathParams: { journalId: { description: 'Positive integer journal identifier' } },
  responses: {
    200: { description: 'Posted', schema: PostJournalEntryResponse },
    400: validationFailure,
    401: unauthorised,
    403: forbidden,
    404: notFound,
    409: conflict,
    500: serverError,
  },
});

journalEntriesRouter.post(
  '/journal-entries/:journalId/post',
  ah((req) => {
    const { journalId } = JournalIdParam.parse(req.params);
    return postJournalEntry(journalId, principal(req));
  }),
);

// ---- ED-007 GET /journal-entries/:journalId/navigation --------------------

documented({
  method: 'get',
  path: '/journal-entries/:journalId/navigation',
  tag: 'journal-entries',
  summary: 'ED-007: Get first / previous / next / last navigation IDs',
  auth: 'bearer',
  pathParams: { journalId: { description: 'Positive integer journal identifier' } },
  query: NavigationQuery,
  responses: {
    200: { description: 'Navigation context', schema: NavigationContextResponse },
    400: validationFailure,
    401: unauthorised,
    404: notFound,
    500: serverError,
  },
});

journalEntriesRouter.get(
  '/journal-entries/:journalId/navigation',
  ah((req) => {
    const { journalId } = JournalIdParam.parse(req.params);
    // ZodError from query parse -> error handler -> 400 with field.
    const query = NavigationQuery.parse(req.query);
    return getNavigationContext(journalId, query);
  }),
);

// ---- ED-004 GET /journal-entries/:journalId/lines -------------------------

documented({
  method: 'get',
  path: '/journal-entries/:journalId/lines',
  tag: 'journal-entries',
  summary: 'ED-004: List line items for a journal entry',
  auth: 'bearer',
  pathParams: { journalId: { description: 'Positive integer journal identifier' } },
  responses: {
    200: { description: 'Line items', schema: LinesResponse },
    401: unauthorised,
    404: notFound,
    500: serverError,
  },
});

journalEntriesRouter.get(
  '/journal-entries/:journalId/lines',
  ah((req) => {
    const { journalId } = JournalIdParam.parse(req.params);
    return { journalId, lines: listLines(journalId) };
  }),
);

// ---- ED-004 POST /journal-entries/:journalId/lines ------------------------

documented({
  method: 'post',
  path: '/journal-entries/:journalId/lines',
  tag: 'journal-entries',
  summary: 'ED-004: Add a line item (Unposted only; mutual exclusion enforced)',
  auth: 'bearer',
  pathParams: { journalId: { description: 'Positive integer journal identifier' } },
  requestBody: CreateLineItemBody,
  responses: {
    201: { description: 'Line item created', schema: LineItemSchema },
    400: validationFailure,
    401: unauthorised,
    403: forbidden,
    404: notFound,
    500: serverError,
  },
});

journalEntriesRouter.post(
  '/journal-entries/:journalId/lines',
  ah((req, res) => {
    const { journalId } = JournalIdParam.parse(req.params);
    const body = CreateLineItemBody.parse(req.body);
    const result = createLine(journalId, body);
    res.status(201);
    return result;
  }),
);

// ---- ED-004 PUT /journal-entries/:journalId/lines/:lineId ----------------

documented({
  method: 'put',
  path: '/journal-entries/:journalId/lines/:lineId',
  tag: 'journal-entries',
  summary: 'ED-004: Update a line item (Unposted only)',
  auth: 'bearer',
  pathParams: {
    journalId: { description: 'Positive integer journal identifier' },
    lineId: { description: 'Positive integer line identifier' },
  },
  requestBody: UpdateLineItemBody,
  responses: {
    200: { description: 'Line item updated', schema: LineItemSchema },
    400: validationFailure,
    401: unauthorised,
    403: forbidden,
    404: notFound,
    500: serverError,
  },
});

journalEntriesRouter.put(
  '/journal-entries/:journalId/lines/:lineId',
  ah((req) => {
    const { journalId, lineId } = JournalIdLineIdParam.parse(req.params);
    const body = UpdateLineItemBody.parse(req.body);
    return updateLine(journalId, lineId, body);
  }),
);

// ---- ED-004 DELETE /journal-entries/:journalId/lines/:lineId -------------

documented({
  method: 'delete',
  path: '/journal-entries/:journalId/lines/:lineId',
  tag: 'journal-entries',
  summary: 'ED-004: Delete a line item (Unposted only)',
  auth: 'bearer',
  pathParams: {
    journalId: { description: 'Positive integer journal identifier' },
    lineId: { description: 'Positive integer line identifier' },
  },
  responses: {
    204: { description: 'No content' },
    401: unauthorised,
    403: forbidden,
    404: notFound,
    500: serverError,
  },
});

journalEntriesRouter.delete(
  '/journal-entries/:journalId/lines/:lineId',
  ah((req, res) => {
    const { journalId, lineId } = JournalIdLineIdParam.parse(req.params);
    deleteLine(journalId, lineId);
    res.status(204).send();
    return undefined;
  }),
);
