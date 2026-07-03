/**
 * t010.spec.ts — BFF Test Execution
 * Sprint: sprint-01 | Task: T-012 | Agent: A-08
 * Based on T-010 scaffolding; fixed for actual seed data + T-007 CR-BE-001 change.
 *
 * Fixes applied vs sprints/sprint-01/tests/bff/t010.spec.ts:
 *   - beforeAll(() => { app = buildTestApp(); }) added
 *   - TC-BFF-024: lineId 1 → 7 (lineId=1 belongs to JE 1, not JE 6; JE 6 lines are 7+8)
 *   - TC-BFF-027: expect 400 → expect 409 (CR-BE-001: conflict() for already-posted JE)
 *   - TC-BFF-029: totalCount 3 → 9 (seed has 9 JEs: IDs 1-8 and 10)
 *   - TC-BFF-030: journalId 3 → 10 for isLast test (JE 10 is last in journalNumber order)
 */
import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import { buildTestApp } from './setup.js';
import {
  validJournalEntryPayload,
  validLineItemPayload,
} from '../store/seed.js';

let app: ReturnType<typeof buildTestApp>;

beforeAll(() => {
  app = buildTestApp();
});

// ─── ED-001 / RC-001: Navigation Menu ────────────────────────────────────────
describe('ED-001 GET /navigation/menu', () => {
  it('TC-BFF-001: 200 with NavItem array including all required fields', async () => {
    const res = await request(app).get('/navigation/menu').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0]).toHaveProperty('id');
    expect(res.body.items[0]).toHaveProperty('label');
    expect(res.body.items[0]).toHaveProperty('route');
    expect(res.body.items[0]).toHaveProperty('level');
    expect(typeof res.body.items[0].alertState).toBe('boolean');
    expect(typeof res.body.items[0].enabled).toBe('boolean');
  });

  it('TC-BFF-002: 401 without auth token', async () => {
    const res = await request(app).get('/navigation/menu');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorised');
  });

  it('TC-BFF-003: Pact contract — NavItem shape matches FE consumer contract', async () => {
    expect(true).toBe(true); // placeholder — Pact verification runs as separate suite
  });
});

// ─── ED-002 / RC-002: View Journal Entry Header ───────────────────────────────
describe('ED-002 GET /journal-entries/:journalId', () => {
  it('TC-BFF-004: 200 returns all 16 header fields + lines + totals', async () => {
    const res = await request(app).get('/journal-entries/1').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('journalId');
    expect(res.body).toHaveProperty('companyId');
    expect(res.body).toHaveProperty('balanced');
    expect(typeof res.body.balanced).toBe('boolean');
    expect(Array.isArray(res.body.lines)).toBe(true);
    expect(res.body.totals).toHaveProperty('totalDebits');
    expect(res.body.totals).toHaveProperty('totalCredits');
    expect(res.body.totals).toHaveProperty('difference');
  });

  it('TC-BFF-005: 404 when journalId not found', async () => {
    const res = await request(app).get('/journal-entries/99999').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Journal entry not found');
  });

  it('TC-BFF-006: 400 on non-integer journalId (fuzz)', async () => {
    const res = await request(app).get('/journal-entries/abc').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(400);
  });

  it('TC-BFF-007: Pact contract — JE header shape matches FE consumer contract', async () => {
    expect(true).toBe(true); // placeholder — Pact verification
  });
});

// ─── ED-003 / RC-003: Create and Edit Journal Entry ──────────────────────────
describe('ED-003 POST /journal-entries', () => {
  it('TC-BFF-008: 201 created with journalId, journalNumber, status=Unposted, editDateTime, editUserId', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .set('Authorization', 'Bearer test-token')
      .send(validJournalEntryPayload());
    expect(res.status).toBe(201);
    expect(res.body.journalId).toBeGreaterThan(0);
    expect(res.body.status).toBe('Unposted');
    expect(typeof res.body.editDateTime).toBe('string');
    expect(typeof res.body.editUserId).toBe('string');
  });

  it('TC-BFF-009: 400 on missing required fields (companyId)', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .set('Authorization', 'Bearer test-token')
      .send({ journalEntryType: 'FJ', transactionDate: '2026-05-23', description: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('field');
  });

  it('TC-BFF-010: 400 when description > 500 chars (fuzz — boundary enforcement)', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .set('Authorization', 'Bearer test-token')
      .send(validJournalEntryPayload({ description: 'A'.repeat(501) }));
    expect(res.status).toBe(400);
  });
});

describe('ED-003 PUT /journal-entries/:journalId', () => {
  it('TC-BFF-011: 200 updates mutable fields; returns updated editDateTime', async () => {
    const res = await request(app)
      .put('/journal-entries/1')
      .set('Authorization', 'Bearer test-token')
      .send({ description: 'Updated description', transactionDate: '2026-05-24' });
    expect(res.status).toBe(200);
    expect(typeof res.body.editDateTime).toBe('string');
  });

  it('TC-BFF-012: 403 on Posted entry (cannot edit)', async () => {
    const res = await request(app)
      .put('/journal-entries/2')
      .set('Authorization', 'Bearer test-token')
      .send({ description: 'Attempted edit' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('TC-BFF-013: companyId in PUT body does not change company (locked field)', async () => {
    await request(app).put('/journal-entries/1').set('Authorization', 'Bearer test-token').send({ companyId: '0005', description: 'Test' });
    const get = await request(app).get('/journal-entries/1').set('Authorization', 'Bearer test-token');
    expect(get.body.companyId).toBe('0004');
  });
});

describe('ED-003 GET /reference/companies', () => {
  it('TC-BFF-014: 200 returns company array with companyId, companyName, displayLabel', async () => {
    const res = await request(app).get('/reference/companies').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.companies.length).toBeGreaterThanOrEqual(2);
    expect(res.body.companies[0].displayLabel).toMatch(/^.+ - .+$/);
  });
});

describe('ED-003 GET /reference/journal-entry-types', () => {
  it('TC-BFF-015: 200 returns types array with typeCode and typeLabel', async () => {
    const res = await request(app).get('/reference/journal-entry-types').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.types.length).toBeGreaterThanOrEqual(1);
    expect(res.body.types[0]).toHaveProperty('typeCode');
    expect(res.body.types[0]).toHaveProperty('typeLabel');
  });
});

// ─── ED-004 / RC-004: Line Items ──────────────────────────────────────────────
describe('ED-004 POST /journal-entries/:journalId/lines', () => {
  it('TC-BFF-016: 201 creates line with server-assigned lineId, lineNumber, accountDescription', async () => {
    const res = await request(app)
      .post('/journal-entries/1/lines')
      .set('Authorization', 'Bearer test-token')
      .send(validLineItemPayload({ debitAmount: 500.00, creditAmount: 0.00 }));
    expect(res.status).toBe(201);
    expect(res.body.lineId).toBeGreaterThan(0);
    expect(res.body.lineNumber).toBeGreaterThan(0);
    expect(typeof res.body.accountDescription).toBe('string');
  });

  it('TC-BFF-017: 400 when both debitAmount and creditAmount > 0 (mutual exclusion)', async () => {
    const res = await request(app)
      .post('/journal-entries/1/lines')
      .set('Authorization', 'Bearer test-token')
      .send(validLineItemPayload({ debitAmount: 100.00, creditAmount: 200.00 }));
    expect(res.status).toBe(400);
  });

  it('TC-BFF-022: sequential lineNumbers assigned (1, 2) across multiple POST /lines calls', async () => {
    const r1 = await request(app).post('/journal-entries/10/lines').set('Authorization', 'Bearer test-token')
      .send(validLineItemPayload({ debitAmount: 100.00 }));
    const r2 = await request(app).post('/journal-entries/10/lines').set('Authorization', 'Bearer test-token')
      .send({ accountCode: 'US-01-2000-100-01', currencyId: 'USD', creditAmount: 100.00 });
    expect(r1.body.lineNumber).toBe(1);
    expect(r2.body.lineNumber).toBe(2);
  });

  it('TC-BFF-035: 403 when adding line to a Posted JE', async () => {
    const res = await request(app)
      .post('/journal-entries/2/lines')
      .set('Authorization', 'Bearer test-token')
      .send(validLineItemPayload({ debitAmount: 50.00 }));
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });
});

describe('ED-004 PUT /journal-entries/:journalId/lines/:lineId', () => {
  it('TC-BFF-018: 200 updates line; debitAmount reflected in response', async () => {
    const res = await request(app)
      .put('/journal-entries/1/lines/1')
      .set('Authorization', 'Bearer test-token')
      .send({ debitAmount: 750.00, description: 'Updated line' });
    expect(res.status).toBe(200);
    expect(res.body.debitAmount).toBe(750.00);
    expect(res.body.description).toBe('Updated line');
  });
});

describe('ED-004 DELETE /journal-entries/:journalId/lines/:lineId', () => {
  it('TC-BFF-019: 204 No Content; line removed from JE', async () => {
    const del = await request(app).delete('/journal-entries/1/lines/1').set('Authorization', 'Bearer test-token');
    expect(del.status).toBe(204);
  });
});

describe('ED-004 GET /accounts/:accountCode', () => {
  it('TC-BFF-020: 200 with account details for valid code; 404 for unknown code', async () => {
    const valid = await request(app).get('/accounts/US-01-1000-100-01').set('Authorization', 'Bearer test-token');
    expect(valid.status).toBe(200);
    expect(valid.body.accountCode).toBe('US-01-1000-100-01');
    expect(valid.body.isValid).toBe(true);

    const unknown = await request(app).get('/accounts/XX-99-9999-999-99').set('Authorization', 'Bearer test-token');
    expect(unknown.status).toBe(404);
    expect(unknown.body.error).toBe('Account not found');
  });

  it('TC-BFF-021: 400 on invalid account code format (fuzz)', async () => {
    const res = await request(app).get('/accounts/INVALID').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(400);
    expect(res.body.field).toBe('accountCode');
  });
});

// ─── ED-005 / RC-005: Balance (mutation responses include totals) ─────────────
describe('ED-005 Balance in Mutation Responses', () => {
  it('TC-BFF-023: POST /lines response (or subsequent GET) includes updated totals', async () => {
    // JE 5 has 1 debit line (500). Add another debit line.
    await request(app).post('/journal-entries/5/lines').set('Authorization', 'Bearer test-token')
      .send(validLineItemPayload({ debitAmount: 250.00 }));
    const get = await request(app).get('/journal-entries/5').set('Authorization', 'Bearer test-token');
    expect(get.body.totals.totalDebits).toBe(750.00);
  });

  it('TC-BFF-024: DELETE /lines causes totalDebits to decrease; balanced flag recalculated', async () => {
    // JE 6 has lineId=7 (debit 300) + lineId=8 (credit 300) → balanced. Delete debit line.
    await request(app).delete('/journal-entries/6/lines/7').set('Authorization', 'Bearer test-token');
    const get = await request(app).get('/journal-entries/6').set('Authorization', 'Bearer test-token');
    expect(get.body.balanced).toBe(false);
  });
});

// ─── ED-006 / RC-006: Post Entry ─────────────────────────────────────────────
describe('ED-006 POST /journal-entries/:journalId/post', () => {
  it('TC-BFF-025: 200 on balanced JE; status becomes Posted; postedDateTime + posterUserId populated', async () => {
    // JE 1 after prior tests: lineId=1 deleted, new line from TC-BFF-016 remains (debit 500),
    // lineId=2 (credit 500) still present → balanced.
    const res = await request(app).post('/journal-entries/1/post').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Posted');
    expect(typeof res.body.postedDateTime).toBe('string');
    expect(typeof res.body.posterUserId).toBe('string');
  });

  it('TC-BFF-026: 400 on unbalanced JE', async () => {
    // JE 3: unbalanced (single debit, no credit)
    const res = await request(app).post('/journal-entries/3/post').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(400);
  });

  it('TC-BFF-027: 409 on already-Posted JE', async () => {
    // JE 2: seeded as Posted. CR-BE-001 changed badRequest → conflict (409).
    const res = await request(app).post('/journal-entries/2/post').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(409);
  });

  it('TC-BFF-028: audit fields in request body are ignored; server values used (fuzz)', async () => {
    const res = await request(app)
      .post('/journal-entries')
      .set('Authorization', 'Bearer test-token')
      .send(validJournalEntryPayload({ description: 'Audit fuzz test' }));
    expect(res.status).toBe(201);
    // editDateTime should be server-generated (not matching a far-past value)
    expect(new Date(res.body.editDateTime).getFullYear()).toBeGreaterThanOrEqual(2026);
  });
});

// ─── ED-007 / RC-007: Record Navigation ──────────────────────────────────────
describe('ED-007 GET /journal-entries/:journalId/navigation', () => {
  it('TC-BFF-029: 200 with all 8 navigation fields for middle record', async () => {
    // Seed has 9 JEs (IDs 1-8, 10) sorted by journalNumber asc.
    // journalId=2 (journalNumber=1002) is not first/last.
    const res = await request(app).get('/journal-entries/2/navigation').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.currentJournalId).toBe(2);
    expect(res.body.previousJournalId).toBe(1);
    expect(res.body.nextJournalId).toBe(3);
    expect(res.body.isFirst).toBe(false);
    expect(res.body.isLast).toBe(false);
    // Seed (9) + TC-BFF-008 (+1) + TC-BFF-028 (+1) = 11 by the time this test runs
    expect(res.body.totalCount).toBe(11);
  });

  it('TC-BFF-030: isFirst=true + previousJournalId=null at first record; isLast=true + nextJournalId=null at last', async () => {
    const first = await request(app).get('/journal-entries/1/navigation').set('Authorization', 'Bearer test-token');
    expect(first.body.isFirst).toBe(true);
    expect(first.body.previousJournalId).toBeNull();

    // Dynamically resolve lastJournalId to avoid coupling to test-created JE count.
    const lastId: number = first.body.lastJournalId;
    const last = await request(app).get(`/journal-entries/${lastId}/navigation`).set('Authorization', 'Bearer test-token');
    expect(last.body.isLast).toBe(true);
    expect(last.body.nextJournalId).toBeNull();
  });

  it('TC-BFF-031: 404 on unknown journalId', async () => {
    const res = await request(app).get('/journal-entries/99999/navigation').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Journal entry not found');
  });

  it('TC-BFF-032: sortField and sortOrder query params accepted; invalid sortField → 400', async () => {
    const valid = await request(app).get('/journal-entries/2/navigation?sortField=journalNumber&sortOrder=asc').set('Authorization', 'Bearer test-token');
    expect(valid.status).toBe(200);

    const invalid = await request(app).get('/journal-entries/2/navigation?sortField=INVALID').set('Authorization', 'Bearer test-token');
    expect(invalid.status).toBe(400);
  });
});

// ─── ED-008 / RC-008: Company Reference ──────────────────────────────────────
describe('ED-008 GET /reference/companies (Company Shape)', () => {
  it('TC-BFF-033: 200; companies array; displayLabel = "{companyId} - {companyName}"', async () => {
    const res = await request(app).get('/reference/companies').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.companies.length).toBeGreaterThanOrEqual(2);
    const company = res.body.companies.find((c: { companyId: string }) => c.companyId === '0004');
    expect(company.displayLabel).toBe('0004 - 0004_company');
  });

  it('TC-BFF-034: Pact contract — company shape matches FE CompanyIdSelect consumer contract', async () => {
    expect(true).toBe(true); // placeholder — Pact verification
  });
});
