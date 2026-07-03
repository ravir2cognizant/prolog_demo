#!/usr/bin/env node
// build-review-report.mjs
//
// Reads a review-rework ledger JSON produced by A-04 or A-05 at the end
// of a rework cycle, and emits a comprehensive xlsx report at the matching
// path under sprints/<sprintId>/review-outputs/.
//
// Usage:
//   node build-review-report.mjs --sprint sprint-01 --agent A-05
//   node build-review-report.mjs --ledger path/to/ledger.json --out path/to/report.xlsx
//
// Ledger schema (see SKILL: Review Comment Implementation in
// agentic-pipeline/.claude/agents/A-04-frontend-developer-skills.md and A-05-backend-developer-skills.md):
//
// R5 SRP fix: T-007 is now consolidated (code-review CRs + test defects in one
// rework pass). The ledger's `comments[]` array may contain entries from either
// source. The `category` field distinguishes them:
//   - "code-review" / "arch-review" -- from A-06 (CR-*.md)
//   - "test-defect"                  -- from A-07/A-08 (DEF-*.md)
//
// {
//   "agent": "A-05",
//   "sprint": "sprint-01",
//   "generatedAt": "ISO 8601",
//   "summary": { "total": N, "implemented": N, "partially": N,
//                "deferred": N, "rejected": N, "notApplicable": N },
//   "comments": [
//     {
//       "id": "CR-001" | "DEF-BFF-007",
//       "category": "code-review" | "arch-review" | "test-defect",
//       "severity": "critical" | "high" | "medium" | "low" | "info",
//       "location": "app/backend/src/path:line",
//       "reviewer": "name" | "A-07" | "A-08",
//       "date": "YYYY-MM-DD",
//       "comment": "comment / observed-vs-expected summary",
//       "status": "implemented" | "partially-implemented" | "deferred" |
//                 "rejected" | "not-applicable",
//       "implementation": "what was changed",
//       "filesModified": ["app/backend/src/...", "..."],
//       "reason": "only when status != implemented",
//       "followUp": false,
//       "testCase":  "TC-BFF-007"   // optional, present only when category=test-defect
//     }
//   ]
// }

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import ExcelJS from 'exceljs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith('--')) out[k.slice(2)] = argv[i + 1];
  }
  return out;
}

function resolvePaths(args) {
  if (args.ledger && args.out) {
    return { ledgerPath: path.resolve(args.ledger), outPath: path.resolve(args.out) };
  }
  if (!args.sprint || !args.agent) {
    throw new Error('Provide either --ledger + --out, OR --sprint + --agent');
  }
  const dir = path.join(WORKSPACE_ROOT, 'sprints', args.sprint, 'review-outputs');
  const ledgerPath = path.join(dir, `${args.agent}-ledger.json`);
  const outPath = path.join(dir, `${args.agent}-rework-report.xlsx`);
  return { ledgerPath, outPath };
}

const STATUS_COLOURS = {
  'implemented':           'FF1F7A3F',
  'partially-implemented': 'FF9C5A00',
  'deferred':              'FF4A5568',
  'rejected':              'FFB42318',
  'not-applicable':        'FF8A93A6',
};
const SEVERITY_COLOURS = {
  'critical': 'FFB42318',
  'high':     'FF9C5A00',
  'medium':   'FF243B70',
  'low':      'FF4A5568',
  'info':     'FF8A93A6',
};
const CATEGORY_COLOURS = {
  'code-review': 'FF2D4A8A',
  'arch-review': 'FF7B2D8A',
  'test-defect': 'FF8A2D5A',   // R5 SRP fix: test defects from A-07/A-08
};

function setCellBadge(cell, value, palette) {
  cell.value = value;
  const colour = palette[value] ?? 'FF8A93A6';
  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colour } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
}

async function build(ledger, outPath) {
  const wb = new ExcelJS.Workbook();
  wb.creator = ledger.agent ?? 'pipeline-scripts';
  wb.created = new Date();

  // ---------- Summary sheet ----------
  const sum = wb.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
  sum.columns = [
    { header: 'Field', key: 'k', width: 28 },
    { header: 'Value', key: 'v', width: 60 },
  ];
  sum.getRow(1).font = { bold: true };
  sum.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6ECF5' } };

  const s = ledger.summary ?? {};
  const rows = [
    ['Agent',                ledger.agent ?? ''],
    ['Sprint',               ledger.sprint ?? ''],
    ['Generated at',         ledger.generatedAt ?? new Date().toISOString()],
    ['Total comments',       s.total ?? ledger.comments?.length ?? 0],
    ['Implemented',          s.implemented ?? 0],
    ['Partially implemented',s.partially ?? 0],
    ['Deferred',             s.deferred ?? 0],
    ['Rejected',             s.rejected ?? 0],
    ['Not applicable',       s.notApplicable ?? 0],
  ];
  rows.forEach(([k, v]) => sum.addRow({ k, v }));

  sum.addRow({});
  const breakdownHeader = sum.addRow({ k: 'By category', v: 'Implemented / Total' });
  breakdownHeader.font = { bold: true };
  const byCat = bucketBy(ledger.comments ?? [], (c) => c.category ?? 'unknown');
  for (const [cat, list] of Object.entries(byCat)) {
    const implemented = list.filter((c) => c.status === 'implemented').length;
    sum.addRow({ k: cat, v: `${implemented} / ${list.length}` });
  }

  sum.addRow({});
  const sevHeader = sum.addRow({ k: 'By severity', v: 'Implemented / Total' });
  sevHeader.font = { bold: true };
  const bySev = bucketBy(ledger.comments ?? [], (c) => c.severity ?? 'unknown');
  for (const sev of ['critical', 'high', 'medium', 'low', 'info']) {
    const list = bySev[sev] ?? [];
    if (list.length === 0) continue;
    const implemented = list.filter((c) => c.status === 'implemented').length;
    sum.addRow({ k: sev, v: `${implemented} / ${list.length}` });
  }

  // ---------- Comments sheet ----------
  const ws = wb.addWorksheet('Comments', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: 'ID',             key: 'id',             width: 14 },
    { header: 'Category',       key: 'category',       width: 14 },
    { header: 'Test case',      key: 'testCase',       width: 14 },
    { header: 'Severity',       key: 'severity',       width: 10 },
    { header: 'Location',       key: 'location',       width: 45 },
    { header: 'Reviewer',       key: 'reviewer',       width: 18 },
    { header: 'Date',           key: 'date',           width: 12 },
    { header: 'Comment',        key: 'comment',        width: 50 },
    { header: 'Status',         key: 'status',         width: 18 },
    { header: 'Implementation', key: 'implementation', width: 50 },
    { header: 'Files modified', key: 'filesModified',  width: 40 },
    { header: 'Reason (if not implemented)', key: 'reason', width: 50 },
    { header: 'Follow-up',      key: 'followUp',       width: 10 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D4A8A' } };
  ws.getRow(1).alignment = { vertical: 'middle' };

  const comments = (ledger.comments ?? []).slice().sort((a, b) => {
    // arch-review first, then code-review; severity highâ†’low; id alpha
    if ((a.category ?? '') !== (b.category ?? '')) return (a.category ?? '').localeCompare(b.category ?? '');
    const sev = ['critical', 'high', 'medium', 'low', 'info'];
    const da = sev.indexOf(a.severity ?? 'info');
    const db = sev.indexOf(b.severity ?? 'info');
    if (da !== db) return da - db;
    return (a.id ?? '').localeCompare(b.id ?? '');
  });

  for (const c of comments) {
    const r = ws.addRow({
      id: c.id ?? '',
      category: c.category ?? '',
      testCase: c.testCase ?? '',
      severity: c.severity ?? '',
      location: c.location ?? '',
      reviewer: c.reviewer ?? '',
      date: c.date ?? '',
      comment: c.comment ?? '',
      status: c.status ?? '',
      implementation: c.implementation ?? '',
      filesModified: Array.isArray(c.filesModified) ? c.filesModified.join('\n') : (c.filesModified ?? ''),
      reason: c.reason ?? '',
      followUp: c.followUp ? 'Yes' : '',
    });
    r.alignment = { vertical: 'top', wrapText: true };
    setCellBadge(r.getCell('category'), c.category ?? '', CATEGORY_COLOURS);
    setCellBadge(r.getCell('severity'), c.severity ?? '', SEVERITY_COLOURS);
    setCellBadge(r.getCell('status'),   c.status   ?? '', STATUS_COLOURS);
  }

  await wb.xlsx.writeFile(outPath);
}

function bucketBy(arr, keyFn) {
  return arr.reduce((acc, x) => {
    const k = keyFn(x);
    (acc[k] ||= []).push(x);
    return acc;
  }, {});
}

async function main() {
  const args = parseArgs(process.argv);
  const { ledgerPath, outPath } = resolvePaths(args);
  if (!existsSync(ledgerPath)) {
    console.error(`Ledger not found: ${ledgerPath}`);
    process.exit(1);
  }
  const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
  await build(ledger, outPath);
  const cwd = process.cwd();
  console.log(`Wrote: ${path.relative(cwd, outPath)}`);
  console.log(`  ${ledger.comments?.length ?? 0} comments | agent=${ledger.agent} | sprint=${ledger.sprint}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
