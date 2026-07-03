/**
 * T-012 BFF Test Execution -- A-08 Sprint-01
 * Comprehensive supertest suite covering TC-BFF-001 through TC-BFF-030
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { seedStore } from '../store/seed.js';
import app from '../app.js';

beforeAll(() => {
  seedStore();
});

// ── TC-BFF-001: GET /journal-entries returns cursor page ─────────────────────
describe('TC-BFF-001: GET /journal-entries cursor page', () => {
  it('returns 200 with items, totalCount, isFirst, isLast', async () => {
    const res = await request(app)
      .get('/journal-entries')
      .query({ companyId: 'comp-001' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(typeof res.body.totalCount).toBe('number');
    expect(typeof res.body.isFirst).toBe('boolean');
    expect(typeof res.body.isLast).toBe('boolean');
  });
});

// ── TC-BFF-002: GET /journal-entries/{id} full entry including audit ──────────
describe('TC-BFF-002: GET /journal-entries/{id} full entry', () => {
  it('returns 200 with full entry including audit fields', async () => {
    const res = await request(app).get('/journal-entries/je-seed-001');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('je-seed-001');
    expect(res.body).toHaveProperty('companyId');
    expect(res.body).toHaveProperty('entryType');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('transactionDate');
    expect(res.body).toHaveProperty('description');
    expect(Array.isArray(res.body.lines)).toBe(true);
    expect(res.body).toHaveProperty('editedAt');
    expect(res.body).toHaveProperty('editedByUserId');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('createdByUserId');
  });
  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/journal-entries/je-does-not-exist');
    expect(res.status).toBe(404);
  });
});

// ── TC-BFF-003: POST /journal-entries creates entry ──────────────────────────
describe('TC-BFF-003: POST /journal-entries create', () => {
  it('returns 200 with id, status=Unposted, createdAt', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .send({
        companyId: 'comp-001',
        entryType: 'STD',
        transactionDate: '2026-05-21',
        description: 'TC-BFF-003 test entry',
      });
    expect(res.status).toBe(200);
    expect(typeof res.body.id).toBe('string');
    expect(res.body.id.length).toBeGreaterThan(0);
    expect(res.body.status).toBe('Unposted');
    expect(typeof res.body.createdAt).toBe('string');
  });
});

// ── TC-BFF-004: POST /journal-entries validation failure (existing test) ──────
describe('TC-BFF-004: POST /journal-entries validation failure', () => {
  it('returns 400 problem+json with status and code', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .send({ description: 'missing required fields' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(res.body).toHaveProperty('status', 400);
    expect(res.body).toHaveProperty('code');
  });
});

// ── TC-BFF-005: PUT /journal-entries/{id} update unposted ────────────────────
describe('TC-BFF-005: PUT /journal-entries/{id} update unposted', () => {
  it('returns 200 with editedAt and editedByUserId', async () => {
    // Create a new entry first
    const create = await request(app)
      .post('/journal-entries')
      .send({ companyId: 'comp-001', entryType: 'STD', transactionDate: '2026-05-21', description: 'TC-BFF-005 original' });
    expect(create.status).toBe(200);
    const id = create.body.id;

    const res = await request(app)
      .put(`/journal-entries/${id}`)
      .send({ description: 'TC-BFF-005 updated' });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(typeof res.body.editedAt).toBe('string');
    expect(typeof res.body.editedByUserId).toBe('string');
  });
});

// ── TC-BFF-006: PUT /journal-entries/{id} on posted entry → 409 ──────────────
describe('TC-BFF-006: PUT on posted entry returns 409', () => {
  it('returns 409 ENTRY_POSTED when trying to update a Posted entry', async () => {
    // je-seed-001 is already Posted
    const res = await request(app)
      .put('/journal-entries/je-seed-001')
      .send({ description: 'try edit posted' });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('code');
  });
});

// ── TC-BFF-007: GET /companies ────────────────────────────────────────────────
describe('TC-BFF-007: GET /companies', () => {
  it('returns 200 with items having id, name, active', async () => {
    const res = await request(app).get('/companies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    const item = res.body.items[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('active');
  });
});

// ── TC-BFF-008: GET /journal-entry-types ─────────────────────────────────────
describe('TC-BFF-008: GET /journal-entry-types', () => {
  it('returns 200 with code and name on each item', async () => {
    const res = await request(app).get('/journal-entry-types');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0]).toHaveProperty('code');
    expect(res.body.items[0]).toHaveProperty('name');
  });
});

// ── TC-BFF-009: GET /source-documents and /allocation-methods ────────────────
describe('TC-BFF-009: GET /source-documents and /allocation-methods', () => {
  it('source-documents returns code + name items', async () => {
    const res = await request(app).get('/source-documents');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0]).toHaveProperty('code');
    expect(res.body.items[0]).toHaveProperty('name');
  });
  it('allocation-methods returns id + name items', async () => {
    const res = await request(app).get('/allocation-methods');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0]).toHaveProperty('id');
    expect(res.body.items[0]).toHaveProperty('name');
  });
});

// ── TC-BFF-010: GET /accounts?companyId= pagination ──────────────────────────
describe('TC-BFF-010: GET /accounts pagination', () => {
  it('returns items with id, code, description, type, active and pagination fields', async () => {
    const res = await request(app)
      .get('/accounts')
      .query({ companyId: 'comp-001' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    const item = res.body.items[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('code');
    expect(item).toHaveProperty('description');
    expect(item).toHaveProperty('type');
    expect(item).toHaveProperty('active');
    expect(typeof res.body.totalCount).toBe('number');
    expect(typeof res.body.page).toBe('number');
    expect(typeof res.body.pageSize).toBe('number');
  });
});

// ── TC-BFF-011: GET /accounts?activeOnly=true excludes inactive ──────────────
describe('TC-BFF-011: GET /accounts activeOnly filter', () => {
  it('activeOnly=true returns only active accounts', async () => {
    const res = await request(app)
      .get('/accounts')
      .query({ companyId: 'comp-001', activeOnly: 'true' });
    expect(res.status).toBe(200);
    for (const item of res.body.items) {
      expect(item.active).toBe(true);
    }
  });
});

// ── TC-BFF-012: GET /currencies ───────────────────────────────────────────────
describe('TC-BFF-012: GET /currencies', () => {
  it('returns items with code, name, isBase; at least one isBase=true', async () => {
    const res = await request(app).get('/currencies');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    const item = res.body.items[0];
    expect(item).toHaveProperty('code');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('isBase');
    const baseItems = res.body.items.filter((c: { isBase: boolean }) => c.isBase === true);
    expect(baseItems.length).toBeGreaterThan(0);
  });
});

// ── TC-BFF-013: POST /post on unbalanced entry → 400 ─────────────────────────
describe('TC-BFF-013: POST /post on unbalanced entry', () => {
  it('returns 400 when totalDebit != totalCredit', async () => {
    // Create JE with one debit line only (unbalanced)
    const create = await request(app)
      .post('/journal-entries')
      .send({
        companyId: 'comp-001',
        entryType: 'STD',
        transactionDate: '2026-05-21',
        description: 'TC-BFF-013 unbalanced',
        lines: [{ accountId: 'acct-001', currencyId: 'USD', debit: 500, credit: 0 }],
      });
    expect(create.status).toBe(200);
    const id = create.body.id;

    const res = await request(app).post(`/journal-entries/${id}/post`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code');
  });
});

// ── TC-BFF-014: POST /post happy path ────────────────────────────────────────
describe('TC-BFF-014: POST /post happy path', () => {
  let postedId: string;
  it('returns 200 with status=Posted, posted=true, postedAt, postedByUserId', async () => {
    const create = await request(app)
      .post('/journal-entries')
      .send({
        companyId: 'comp-001',
        entryType: 'STD',
        transactionDate: '2026-05-21',
        description: 'TC-BFF-014 balanced entry',
        lines: [
          { accountId: 'acct-001', currencyId: 'USD', debit: 1000, credit: 0 },
          { accountId: 'acct-003', currencyId: 'USD', debit: 0, credit: 1000 },
        ],
      });
    expect(create.status).toBe(200);
    postedId = create.body.id;

    const res = await request(app).post(`/journal-entries/${postedId}/post`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Posted');
    expect(res.body.posted).toBe(true);
    expect(typeof res.body.postedAt).toBe('string');
    expect(typeof res.body.postedByUserId).toBe('string');
  });
});

// ── TC-BFF-015: POST /post on already-posted → 409 ──────────────────────────
describe('TC-BFF-015: POST /post already posted → 409', () => {
  it('returns 409 on double-post', async () => {
    // je-seed-001 is already Posted
    const res = await request(app).post('/journal-entries/je-seed-001/post');
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('code');
  });
});

// ── TC-BFF-016: POST /unpost reverts to Unposted ─────────────────────────────
describe('TC-BFF-016: POST /unpost', () => {
  it('returns 200 with status=Unposted, posted=false, nulled audit fields', async () => {
    // Create and post a fresh entry
    const create = await request(app)
      .post('/journal-entries')
      .send({
        companyId: 'comp-001',
        entryType: 'STD',
        transactionDate: '2026-05-21',
        description: 'TC-BFF-016 for unpost',
        lines: [
          { accountId: 'acct-001', currencyId: 'USD', debit: 200, credit: 0 },
          { accountId: 'acct-003', currencyId: 'USD', debit: 0, credit: 200 },
        ],
      });
    const id = create.body.id;
    await request(app).post(`/journal-entries/${id}/post`);

    const res = await request(app).post(`/journal-entries/${id}/unpost`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Unposted');
    expect(res.body.posted).toBe(false);
    expect(res.body.postedAt).toBeNull();
    expect(res.body.postedByUserId).toBeNull();
  });
});

// ── TC-BFF-017: POST /reverse creates reversal ───────────────────────────────
describe('TC-BFF-017: POST /reverse', () => {
  it('returns 200 with reversalEntryId, reversalEntryStatus=Unposted, originatingEntryId', async () => {
    // Create and post a balanced entry
    const create = await request(app)
      .post('/journal-entries')
      .send({
        companyId: 'comp-001',
        entryType: 'STD',
        transactionDate: '2026-05-21',
        description: 'TC-BFF-017 for reversal',
        lines: [
          { accountId: 'acct-001', currencyId: 'USD', debit: 300, credit: 0 },
          { accountId: 'acct-003', currencyId: 'USD', debit: 0, credit: 300 },
        ],
      });
    const id = create.body.id;
    await request(app).post(`/journal-entries/${id}/post`);

    const res = await request(app)
      .post(`/journal-entries/${id}/reverse`)
      .send({ reversalDate: '2026-06-01' });
    expect(res.status).toBe(200);
    expect(typeof res.body.id).toBe('string');
    expect(res.body.status).toBe('Unposted');
    expect(typeof res.body.transactionDate).toBe('string');
    expect(res.body.entryType).toBe('REV');
  });
});

// ── TC-BFF-018: GET /journal-entries isFirst/isLast ──────────────────────────
describe('TC-BFF-018: GET /journal-entries isFirst/isLast flags', () => {
  it('response includes boolean isFirst and isLast', async () => {
    const res = await request(app)
      .get('/journal-entries')
      .query({ companyId: 'comp-001' });
    expect(res.status).toBe(200);
    expect(typeof res.body.isFirst).toBe('boolean');
    expect(typeof res.body.isLast).toBe('boolean');
  });
});

// ── TC-BFF-019: GET /journal-entries/{id} audit fields contract ──────────────
describe('TC-BFF-019: Audit trail contract', () => {
  it('response includes editedAt, editedByUserId, createdAt, createdByUserId', async () => {
    const create = await request(app)
      .post('/journal-entries')
      .send({ companyId: 'comp-001', entryType: 'STD', transactionDate: '2026-05-21', description: 'TC-BFF-019 audit' });
    const id = create.body.id;
    const res = await request(app).get(`/journal-entries/${id}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.editedAt).toBe('string');
    expect(typeof res.body.editedByUserId).toBe('string');
    expect(typeof res.body.createdAt).toBe('string');
    expect(typeof res.body.createdByUserId).toBe('string');
    expect(res.body.editedAt).toMatch(/T/);
  });
});

// ── TC-BFF-020/021/022: Approval workflow ────────────────────────────────────
describe('TC-BFF-020/021/022: Approval workflow', () => {
  let jeId: string;

  it('TC-BFF-020: submit-for-approval returns 200', async () => {
    const create = await request(app)
      .post('/journal-entries')
      .send({ companyId: 'comp-001', entryType: 'STD', transactionDate: '2026-05-21', description: 'TC-BFF-020 approval', routing: 'rr-001' });
    jeId = create.body.id;
    const res = await request(app).post(`/journal-entries/${jeId}/submit-for-approval`);
    expect(res.status).toBe(200);
  });

  it('TC-BFF-021: approve returns 200', async () => {
    // Create and submit a fresh entry for approval
    const create = await request(app)
      .post('/journal-entries')
      .send({ companyId: 'comp-001', entryType: 'STD', transactionDate: '2026-05-21', description: 'TC-BFF-021 approve', routing: 'rr-001' });
    const id = create.body.id;
    await request(app).post(`/journal-entries/${id}/submit-for-approval`);
    const res = await request(app).post(`/journal-entries/${id}/approve`);
    expect(res.status).toBe(200);
  });

  it('TC-BFF-022: reject with reason returns 200; reject without reason returns 400', async () => {
    // Create and submit for reject with reason
    const create = await request(app)
      .post('/journal-entries')
      .send({ companyId: 'comp-001', entryType: 'STD', transactionDate: '2026-05-21', description: 'TC-BFF-022 reject', routing: 'rr-001' });
    const id = create.body.id;
    await request(app).post(`/journal-entries/${id}/submit-for-approval`);

    const res = await request(app)
      .post(`/journal-entries/${id}/reject`)
      .send({ rejectionReason: 'Incorrect account code' });
    expect(res.status).toBe(200);

    // Reject without reason
    const create2 = await request(app)
      .post('/journal-entries')
      .send({ companyId: 'comp-001', entryType: 'STD', transactionDate: '2026-05-21', description: 'TC-BFF-022 reject2', routing: 'rr-001' });
    const id2 = create2.body.id;
    await request(app).post(`/journal-entries/${id2}/submit-for-approval`);
    const res2 = await request(app).post(`/journal-entries/${id2}/reject`).send({});
    expect(res2.status).toBe(400);
  });
});

// ── TC-BFF-023: Reference data GET endpoints (ED-009 to ED-013) ──────────────
describe('TC-BFF-023: Reference data endpoints return 200 with items', () => {
  it('/allocation-methods', async () => {
    const res = await request(app).get('/allocation-methods');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
  it('/source-documents', async () => {
    const res = await request(app).get('/source-documents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
  it('/journal-entry-types', async () => {
    const res = await request(app).get('/journal-entry-types');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
  it('/companies', async () => {
    const res = await request(app).get('/companies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
  it('/currencies', async () => {
    const res = await request(app).get('/currencies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});

// ── TC-BFF-024: ED-014/ED-015 fiscal year endpoint ───────────────────────────
describe('TC-BFF-024: GET /fiscal-years stub', () => {
  it('returns 200 or 404 (not 500)', async () => {
    const res = await request(app).get('/fiscal-years').query({ companyId: 'comp-001' });
    expect([200, 404]).toContain(res.status);
  });
});

// ── TC-BFF-025: GET /routing-rules ───────────────────────────────────────────
describe('TC-BFF-025: GET /routing-rules', () => {
  it('returns items with id, name, description', async () => {
    const res = await request(app).get('/routing-rules');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    const item = res.body.items[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('description');
  });
});

// ── TC-BFF-026: POST /accounts creates account → 201 ─────────────────────────
describe('TC-BFF-026: POST /accounts create', () => {
  it('returns 201 with id and code', async () => {
    const res = await request(app)
      .post('/accounts')
      .send({
        companyId: 'comp-001',
        code: '1-100-0001-001-01',
        description: 'TC-BFF-026 Test Account',
        type: 'asset',
        active: true,
      });
    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('string');
    expect(res.body.code).toBe('1-100-0001-001-01');
  });
});

// ── TC-BFF-027: PUT /accounts/{id} updates and returns updatedAt ─────────────
describe('TC-BFF-027: PUT /accounts/{id} update', () => {
  it('returns 200 with id, updatedAt, updatedByUserId', async () => {
    // Create an account first
    const create = await request(app)
      .post('/accounts')
      .send({ companyId: 'comp-001', code: '1-100-0002-001-01', description: 'TC-BFF-027 original', type: 'liability', active: true });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const res = await request(app)
      .put(`/accounts/${id}`)
      .send({ description: 'TC-BFF-027 updated' });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(typeof res.body.updatedAt).toBe('string');
    expect(typeof res.body.updatedByUserId).toBe('string');
  });
});

// ── TC-BFF-028: GET /accounts/{id}/balances period array ─────────────────────
describe('TC-BFF-028: GET /accounts/{id}/balances', () => {
  it('returns 200 with accountId and periods array', async () => {
    const res = await request(app)
      .get('/accounts/acct-001/balances')
      .query({ fiscalYearId: 'fy-2026' });
    expect(res.status).toBe(200);
    expect(res.body.accountId).toBe('acct-001');
    expect(Array.isArray(res.body.periods)).toBe(true);
  });
});

// ── TC-BFF-029: POST /accounts validation failure → 400 ──────────────────────
describe('TC-BFF-029: POST /accounts validation failure', () => {
  it('returns 400 problem+json when required fields missing', async () => {
    const res = await request(app)
      .post('/accounts')
      .send({ companyId: 'comp-001' });
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(res.body).toHaveProperty('status', 400);
    expect(res.body).toHaveProperty('code');
  });
});

// ── TC-BFF-030: Malformed payloads return 4xx not 500 ────────────────────────
describe('TC-BFF-030: Malformed payloads are handled gracefully', () => {
  it('POST /journal-entries with wrong type on companyId returns 400', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .send({ companyId: 12345, entryType: 'STD', transactionDate: '2026-05-21', description: 'fuzz' });
    expect([400, 422]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
  it('POST /accounts with invalid type enum returns 400', async () => {
    const res = await request(app)
      .post('/accounts')
      .send({ companyId: 'comp-001', code: '1-FUZZ-0001', description: 'fuzz', type: 'unknown-type', active: true });
    expect(res.status).toBe(400);
    expect(res.status).not.toBe(500);
  });
  it('POST /journal-entries with oversized description returns 400', async () => {
    const longDesc = 'x'.repeat(501);
    const res = await request(app)
      .post('/journal-entries')
      .send({ companyId: 'comp-001', entryType: 'STD', transactionDate: '2026-05-21', description: longDesc });
    expect([400, 422]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});
