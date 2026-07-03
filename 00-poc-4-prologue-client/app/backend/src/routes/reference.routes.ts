import { Router } from 'express';
import { z } from 'zod';
import { ah } from '../controllers/asyncHandler.js';
import { documented } from '../docs/registry.js';
import { serverError, unauthorised } from '../docs/responses.js';
import { listCompanies, listJournalEntryTypes } from '../services/reference.service.js';

const CompanySchema = z.object({
  companyId: z.string(),
  companyName: z.string(),
  displayLabel: z.string(),
});
const JournalEntryTypeSchema = z.object({
  typeCode: z.string(),
  typeLabel: z.string(),
});

const CompaniesResponse = z.object({ companies: z.array(CompanySchema) });
const TypesResponse = z.object({ types: z.array(JournalEntryTypeSchema) });

export const referenceRouter = Router();

documented({
  method: 'get',
  path: '/reference/companies',
  tag: 'reference',
  summary: 'ED-003 / ED-008: List companies accessible to the authenticated user',
  auth: 'bearer',
  responses: {
    200: { description: 'Companies', schema: CompaniesResponse },
    401: unauthorised,
    500: serverError,
  },
});

referenceRouter.get(
  '/reference/companies',
  ah(() => ({ companies: listCompanies() })),
);

documented({
  method: 'get',
  path: '/reference/journal-entry-types',
  tag: 'reference',
  summary: 'ED-003: List valid journal entry types',
  auth: 'bearer',
  responses: {
    200: { description: 'Journal entry types', schema: TypesResponse },
    401: unauthorised,
    500: serverError,
  },
});

referenceRouter.get(
  '/reference/journal-entry-types',
  ah(() => ({ types: listJournalEntryTypes() })),
);
