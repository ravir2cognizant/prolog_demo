import { Router } from 'express';
import { z } from 'zod';
import { ah } from '../controllers/asyncHandler.js';
import { documented } from '../docs/registry.js';
import { unauthorised } from '../docs/responses.js';

const NotImplementedSchema = z
  .object({ error: z.string(), reason: z.string() })
  .describe('501 Not Implemented stub envelope');

export const deferredRouter = Router();

// ---- ED-009 Source Document (deferred -- OQ-011 pending) ------------------

documented({
  method: 'post',
  path: '/journal-entries/:journalId/source-document',
  tag: 'deferred',
  summary: 'ED-009 (deferred): Source document attachment -- pending OQ-011',
  auth: 'bearer',
  responses: {
    501: { description: 'Not implemented', schema: NotImplementedSchema },
    401: unauthorised,
  },
});

deferredRouter.post('/journal-entries/:journalId/source-document', ah((_req, res) => {
  res.status(501);
  return { error: 'Not Implemented', reason: 'ED-009 deferred pending OQ-011 resolution' };
}));

documented({
  method: 'get',
  path: '/journal-entries/:journalId/source-document',
  tag: 'deferred',
  summary: 'ED-009 (deferred): Source document fetch -- pending OQ-011',
  auth: 'bearer',
  responses: {
    501: { description: 'Not implemented', schema: NotImplementedSchema },
    401: unauthorised,
  },
});

deferredRouter.get('/journal-entries/:journalId/source-document', ah((_req, res) => {
  res.status(501);
  return { error: 'Not Implemented', reason: 'ED-009 deferred pending OQ-011 resolution' };
}));

documented({
  method: 'delete',
  path: '/journal-entries/:journalId/source-document',
  tag: 'deferred',
  summary: 'ED-009 (deferred): Source document delete -- pending OQ-011',
  auth: 'bearer',
  responses: {
    501: { description: 'Not implemented', schema: NotImplementedSchema },
    401: unauthorised,
  },
});

deferredRouter.delete('/journal-entries/:journalId/source-document', ah((_req, res) => {
  res.status(501);
  return { error: 'Not Implemented', reason: 'ED-009 deferred pending OQ-011 resolution' };
}));

// ---- ED-010 GL Import (deferred -- OQ-012 pending) ------------------------

documented({
  method: 'post',
  path: '/gl-imports',
  tag: 'deferred',
  summary: 'ED-010 (deferred): GL import submission -- pending OQ-012',
  auth: 'bearer',
  responses: {
    501: { description: 'Not implemented', schema: NotImplementedSchema },
    401: unauthorised,
  },
});

deferredRouter.post('/gl-imports', ah((_req, res) => {
  res.status(501);
  return { error: 'Not Implemented', reason: 'ED-010 deferred pending OQ-012 resolution' };
}));

documented({
  method: 'get',
  path: '/gl-imports/:importId/status',
  tag: 'deferred',
  summary: 'ED-010 (deferred): GL import status -- pending OQ-012',
  auth: 'bearer',
  responses: {
    501: { description: 'Not implemented', schema: NotImplementedSchema },
    401: unauthorised,
  },
});

deferredRouter.get('/gl-imports/:importId/status', ah((_req, res) => {
  res.status(501);
  return { error: 'Not Implemented', reason: 'ED-010 deferred pending OQ-012 resolution' };
}));
