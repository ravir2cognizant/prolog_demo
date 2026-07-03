import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Application } from 'express';
import { buildTestApp } from './setup.js';

describe('validation failures', () => {
  let app: Application;
  beforeAll(() => {
    app = buildTestApp();
  });

  it('POST /journal-entries missing companyId -> 400 + field', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .set('Authorization', 'Bearer dev-token')
      .send({
        journalEntryType: 'FJ',
        transactionDate: '2026-05-23',
        description: 'No company',
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('field');
  });

  it('POST /journal-entries description > 500 chars -> 400', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .set('Authorization', 'Bearer dev-token')
      .send({
        companyId: '0004',
        journalEntryType: 'FJ',
        transactionDate: '2026-05-23',
        description: 'A'.repeat(501),
      });
    expect(res.status).toBe(400);
  });

  it('POST /journal-entries/1/lines with both debit + credit > 0 -> 400', async () => {
    const res = await request(app)
      .post('/journal-entries/1/lines')
      .set('Authorization', 'Bearer dev-token')
      .send({
        accountCode: 'US-01-1000-100-01',
        currencyId: 'USD',
        debitAmount: 100,
        creditAmount: 200,
      });
    expect(res.status).toBe(400);
  });

  it('GET /accounts/INVALID -> 400 with field=accountCode', async () => {
    const res = await request(app)
      .get('/accounts/INVALID')
      .set('Authorization', 'Bearer dev-token');
    expect(res.status).toBe(400);
    expect(res.body.field).toBe('accountCode');
  });

  it('GET /journal-entries/99999 -> 404', async () => {
    const res = await request(app)
      .get('/journal-entries/99999')
      .set('Authorization', 'Bearer dev-token');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Journal entry not found');
  });
});
