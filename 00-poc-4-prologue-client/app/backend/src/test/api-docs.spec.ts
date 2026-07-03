import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Application } from 'express';
import { buildTestApp } from './setup.js';

describe('GET /api-docs', () => {
  let app: Application;
  beforeAll(() => {
    app = buildTestApp();
  });

  it('returns 200 HTML', async () => {
    const res = await request(app).get('/api-docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('Prologue BFF -- API endpoints');
  });

  it('GET /api-docs.json returns non-empty endpoints', async () => {
    const res = await request(app).get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(Array.isArray(res.body.endpoints)).toBe(true);
    // /api-docs must be excluded from its own listing.
    const self = res.body.endpoints.find((e: { path: string }) => e.path === '/api-docs');
    expect(self).toBeUndefined();
    // Known ED-001 route must be present.
    const navMenu = res.body.endpoints.find(
      (e: { method: string; path: string }) =>
        e.method === 'GET' && e.path === '/navigation/menu',
    );
    expect(navMenu).toBeDefined();
    expect(navMenu.auth).toBe('bearer');
    expect(navMenu.tag).toBe('navigation');
  });
});
