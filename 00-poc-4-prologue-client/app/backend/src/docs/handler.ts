import type { Request, Response } from 'express';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { listEndpoints } from './registry.js';

const SELF = '/api-docs';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}

function pre(value: unknown): string {
  return `<pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
}

const METHOD_COLOURS: Record<string, string> = {
  GET: '#1F7A3F',
  POST: '#2D4A8A',
  PATCH: '#9C5A00',
  PUT: '#9C5A00',
  DELETE: '#B42318',
};

interface PreparedEndpoint {
  method: string;
  path: string;
  tag: string;
  summary: string;
  auth: string;
  pathParams?: Record<string, { description?: string }>;
  requestBody?: unknown;
  query?: unknown;
  responses: Record<string, { description: string; schema?: unknown; example?: unknown }>;
}

export function apiDocsHandler(_req: Request, res: Response): void {
  const entries: PreparedEndpoint[] = listEndpoints()
    .filter((d) => d.path !== SELF)
    .map((d) => ({
      method: d.method.toUpperCase(),
      path: d.path,
      tag: d.tag,
      summary: d.summary,
      auth: d.auth,
      pathParams: d.pathParams,
      requestBody: d.requestBody
        ? zodToJsonSchema(d.requestBody, { target: 'jsonSchema7' })
        : undefined,
      query: d.query ? zodToJsonSchema(d.query, { target: 'jsonSchema7' }) : undefined,
      responses: Object.fromEntries(
        Object.entries(d.responses).map(([code, r]) => [
          code,
          {
            description: r.description,
            schema: r.schema ? zodToJsonSchema(r.schema, { target: 'jsonSchema7' }) : undefined,
            example: r.example,
          },
        ]),
      ),
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag) || a.path.localeCompare(b.path));

  const byTag = entries.reduce<Record<string, PreparedEndpoint[]>>((acc, e) => {
    (acc[e.tag] ||= []).push(e);
    return acc;
  }, {});

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Prologue BFF -- API docs</title>
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #F4F5F7; color: #1A2233; }
  header { background: #2D4A8A; color: #fff; padding: 16px 24px; }
  header h1 { margin: 0; font-size: 18px; }
  header .meta { font-size: 12px; opacity: 0.85; margin-top: 4px; }
  main { max-width: 1100px; margin: 0 auto; padding: 24px; }
  h2 { margin-top: 32px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #4A5568; border-bottom: 1px solid #D7DCE3; padding-bottom: 6px; }
  details { background: #fff; border: 1px solid #E6E9EE; border-radius: 6px; margin: 8px 0; }
  summary { padding: 10px 14px; cursor: pointer; display: flex; align-items: center; gap: 12px; }
  summary::-webkit-details-marker { display: none; }
  .method { display: inline-block; min-width: 64px; padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: 600; font-size: 12px; text-align: center; }
  .path { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 600; }
  .auth { font-size: 11px; padding: 2px 6px; border-radius: 9999px; }
  .auth.bearer { background: #FCEFD9; color: #9C5A00; }
  .auth.public { background: #E5F1EA; color: #196333; }
  .summary-text { margin-left: auto; color: #4A5568; font-size: 13px; }
  .body { padding: 0 14px 14px; border-top: 1px solid #E6E9EE; }
  .row { margin: 12px 0; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #4A5568; margin-bottom: 4px; }
  pre { background: #F4F5F7; border: 1px solid #E6E9EE; border-radius: 4px; padding: 10px; overflow-x: auto; font-size: 12px; margin: 0; }
  .status { display: inline-block; min-width: 38px; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #fff; margin-right: 8px; }
  .status.s2 { background: #1F7A3F; }
  .status.s4 { background: #B42318; }
  .status.s5 { background: #4A5568; }
  .empty { color: #8A93A6; font-style: italic; }
  .toc { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 24px; }
  .toc a { background: #fff; border: 1px solid #D7DCE3; padding: 4px 10px; border-radius: 9999px; color: #2D4A8A; text-decoration: none; font-size: 12px; }
  .toc a:hover { background: #E6ECF5; }
</style></head>
<body>
  <header>
    <h1>Prologue BFF -- API endpoints</h1>
    <div class="meta">${entries.length} endpoints &middot; generated ${escapeHtml(new Date().toISOString())} &middot; <code>/api-docs</code> not listed here</div>
  </header>
  <main>
    <div class="toc">
      ${Object.keys(byTag)
        .sort()
        .map((t) => {
          const list = byTag[t] ?? [];
          return `<a href="#${escapeHtml(t)}">${escapeHtml(t)} <small>(${list.length})</small></a>`;
        })
        .join('')}
    </div>
    ${Object.keys(byTag)
      .sort()
      .map((tag) => {
        const list = byTag[tag] ?? [];
        return `<section id="${escapeHtml(tag)}"><h2>${escapeHtml(tag)}</h2>${list
          .map(
            (e) => `
        <details>
          <summary>
            <span class="method" style="background:${METHOD_COLOURS[e.method] ?? '#4A5568'}">${escapeHtml(
              e.method,
            )}</span>
            <span class="path">${escapeHtml(e.path)}</span>
            <span class="auth ${escapeHtml(e.auth)}">${escapeHtml(e.auth)}</span>
            <span class="summary-text">${escapeHtml(e.summary)}</span>
          </summary>
          <div class="body">
            ${e.pathParams ? `<div class="row"><div class="label">Path params</div>${pre(e.pathParams)}</div>` : ''}
            ${e.query ? `<div class="row"><div class="label">Query</div>${pre(e.query)}</div>` : ''}
            ${e.requestBody ? `<div class="row"><div class="label">Request body</div>${pre(e.requestBody)}</div>` : ''}
            <div class="row"><div class="label">Responses</div>
              ${Object.entries(e.responses)
                .map(([code, r]) => {
                  const cls = `s${code[0]}`;
                  return `<div style="margin: 8px 0;">
                  <span class="status ${cls}">${escapeHtml(code)}</span><strong>${escapeHtml(r.description)}</strong>
                  ${r.schema ? pre(r.schema) : '<div class="empty">No body</div>'}
                </div>`;
                })
                .join('')}
            </div>
          </div>
        </details>`,
          )
          .join('')}</section>`;
      })
      .join('')}
  </main>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

/**
 * JSON variant -- used by the ready-to-run gates and tests to confirm that
 * the registry has been populated. Returns a compact summary so /api-docs.json
 * is greppable in CI without parsing HTML.
 */
export function apiDocsJsonHandler(_req: Request, res: Response): void {
  const endpoints = listEndpoints()
    .filter((d) => d.path !== SELF)
    .map((d) => ({
      method: d.method.toUpperCase(),
      path: d.path,
      tag: d.tag,
      auth: d.auth,
      summary: d.summary,
    }));
  res.json({ total: endpoints.length, endpoints });
}
