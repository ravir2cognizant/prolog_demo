import { Router } from 'express';
import { store } from '../store/memoryStore.js';
import { documented } from '../docs/registry.js';
import { apiDocsHandler } from '../docs/handler.js';
import { register } from '../middleware/metrics.js';

const router = Router();

// Public routes - no auth required

router.get('/healthz', (_, res) => {
  res.json({ status: 'ok' });
});

router.get('/readyz', (_, res) => {
  const ready = store.accounts.size > 0;
  if (!ready) return res.status(503).json({ status: 'not ready' });
  res.json({ status: 'ready' });
});

router.get('/metrics', async (_, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

router.get('/api-docs', apiDocsHandler);

// Protected reference-data routes - registered via documented()

documented({
  tag: 'Reference Data',
  method: 'GET',
  path: '/companies',
  summary: 'List companies accessible to the current user',
  responses: { 200: { description: 'Array of company objects' } },
});
router.get('/companies', (req, res) => {
  const activeParam = req.query['active'];
  let items = Array.from(store.companies.values());
  if (activeParam !== undefined) {
    const activeOnly = activeParam === 'true';
    items = items.filter((c) => c.active === activeOnly);
  }
  res.json({ items: items.map((c) => ({ id: c.id, name: c.name, active: c.active })) });
});

documented({
  tag: 'Reference Data',
  method: 'GET',
  path: '/currencies',
  summary: 'List supported currencies',
  responses: { 200: { description: 'Array of currency objects' } },
});
router.get('/currencies', (_req, res) => {
  const items = Array.from(store.currencies.values()).map((c) => ({ code: c.code, name: c.name, isBase: c.isBase }));
  res.json({ items });
});

documented({
  tag: 'Reference Data',
  method: 'GET',
  path: '/journal-entry-types',
  summary: 'List valid journal entry type codes',
  responses: { 200: { description: 'Array of entry type objects' } },
});
router.get('/journal-entry-types', (_req, res) => {
  const items = Array.from(store.journalEntryTypes.values()).map((t) => ({ code: t.code, name: t.name }));
  res.json({ items });
});

documented({
  tag: 'Reference Data',
  method: 'GET',
  path: '/source-documents',
  summary: 'List valid source document type codes',
  responses: { 200: { description: 'Array of source document type objects' } },
});
router.get('/source-documents', (_req, res) => {
  const items = Array.from(store.sourceDocuments.values()).map((s) => ({ code: s.code, name: s.name }));
  res.json({ items });
});

documented({
  tag: 'Reference Data',
  method: 'GET',
  path: '/allocation-methods',
  summary: 'List valid allocation method IDs for JE header dropdown',
  responses: { 200: { description: 'Array of allocation method objects' } },
});
router.get('/allocation-methods', (_req, res) => {
  const items = Array.from(store.allocationMethods.values()).map((m) => ({ id: m.id, name: m.name }));
  res.json({ items });
});

documented({
  tag: 'Reference Data',
  method: 'GET',
  path: '/routing-rules',
  summary: 'List routing rules for JE routing dropdown',
  responses: { 200: { description: 'Array of routing rule objects' } },
});
router.get('/routing-rules', (_req, res) => {
  const items = Array.from(store.routingRules.values()).map((r) => ({ id: r.id, name: r.name, description: r.description }));
  res.json({ items });
});

export default router;
