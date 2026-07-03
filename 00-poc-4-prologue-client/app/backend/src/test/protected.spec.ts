import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Application } from 'express';
import { buildTestApp } from './setup.js';

describe('protected routes via AUTH_DEV_BYPASS', () => {
  let app: Application;
  beforeAll(() => {
    app = buildTestApp();
  });

  it('GET /navigation/menu without Authorization -> 401', async () => {
    const res = await request(app).get('/navigation/menu');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorised');
  });

  it('GET /navigation/menu with bearer token -> 200 + items', async () => {
    const res = await request(app)
      .get('/navigation/menu')
      .set('Authorization', 'Bearer dev-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    const first = res.body.items[0];
    expect(typeof first.alertState).toBe('boolean');
    expect(typeof first.enabled).toBe('boolean');
  });

  it('GET /journal-entries/1 with bearer -> 200 + header + lines + totals', async () => {
    const res = await request(app)
      .get('/journal-entries/1')
      .set('Authorization', 'Bearer dev-token');
    expect(res.status).toBe(200);
    expect(res.body.journalId).toBe(1);
    expect(typeof res.body.balanced).toBe('boolean');
    expect(Array.isArray(res.body.lines)).toBe(true);
    expect(res.body.totals).toHaveProperty('totalDebits');
    expect(res.body.totals).toHaveProperty('totalCredits');
    expect(res.body.totals).toHaveProperty('difference');
  });

  it('GET /reference/companies -> 200 + companies with displayLabel', async () => {
    const res = await request(app)
      .get('/reference/companies')
      .set('Authorization', 'Bearer dev-token');
    expect(res.status).toBe(200);
    expect(res.body.companies.length).toBeGreaterThanOrEqual(2);
    expect(res.body.companies[0].displayLabel).toMatch(/^.+ - .+$/);
  });
});
