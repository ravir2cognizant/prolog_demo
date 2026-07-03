import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Application } from 'express';
import { buildTestApp } from './setup.js';

describe('public endpoints', () => {
  let app: Application;
  beforeAll(() => {
    app = buildTestApp();
  });

  it('GET /healthz returns 200 ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /readyz returns 200 ready', async () => {
    const res = await request(app).get('/readyz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready' });
  });

  it('GET /metrics returns prometheus output', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_request_duration_seconds');
  });
});
