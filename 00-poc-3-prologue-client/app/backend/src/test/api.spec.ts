import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { seedStore } from '../store/seed.js';
import app from '../app.js';

beforeAll(() => {
  seedStore();
});

describe('GET /healthz', () => {
  it('returns 200 with status ok (public, no auth required)', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});

describe('GET /journal-entries', () => {
  it('returns 200 with cursor page when auth dev bypass is active', async () => {
    const res = await request(app)
      .get('/journal-entries')
      .query({ companyId: 'company-001' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty('totalCount');
    expect(res.body).toHaveProperty('isFirst');
    expect(res.body).toHaveProperty('isLast');
  });
});

describe('POST /journal-entries (validation failure)', () => {
  it('returns 400 problem+json when required fields are missing', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .send({ description: 'missing required fields' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(res.body).toHaveProperty('status', 400);
    expect(res.body).toHaveProperty('code');
  });
});

describe('GET /api-docs', () => {
  it('returns 200 with HTML content', async () => {
    const res = await request(app).get('/api-docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('Prologue BFF');
  });
});
