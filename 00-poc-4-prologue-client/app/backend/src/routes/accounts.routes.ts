import { Router } from 'express';
import { z } from 'zod';
import { ah } from '../controllers/asyncHandler.js';
import { documented } from '../docs/registry.js';
import { notFound, serverError, unauthorised, validationFailure } from '../docs/responses.js';
import { lookupAccount } from '../services/account.service.js';

const AccountResponse = z.object({
  accountCode: z.string(),
  accountDescription: z.string(),
  isValid: z.boolean(),
  segment1: z.string(),
  segment2: z.string(),
  segment3: z.string(),
  segment4: z.string(),
  segment5: z.string(),
});

export const accountsRouter = Router();

documented({
  method: 'get',
  path: '/accounts/:accountCode',
  tag: 'accounts',
  summary: 'ED-004: Validate a chartfield account code and return its description',
  auth: 'bearer',
  pathParams: { accountCode: { description: '5-segment chartfield code S1-S2-S3-S4-S5' } },
  responses: {
    200: { description: 'Account details', schema: AccountResponse },
    400: validationFailure,
    401: unauthorised,
    404: notFound,
    500: serverError,
  },
});

accountsRouter.get(
  '/accounts/:accountCode',
  ah((req) => lookupAccount(req.params.accountCode)),
);
