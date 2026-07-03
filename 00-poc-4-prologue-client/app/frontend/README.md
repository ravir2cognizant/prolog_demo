# @prologue/frontend

Prologue Admin Tool SPA (POC, sprint-01). React 18 + Vite + Tailwind +
React Router 7 data router, calling the BFF at `http://localhost:4000`.

## Quick start

```bash
npm install
cp .env.example .env   # (only if .env is missing)
npm run dev            # http://localhost:5173
```

`/dev/routes` lists every route the SPA exposes and the BFF endpoints each
route consumes.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server on http://localhost:5173 |
| `npm run build` | Type-check + production build |
| `npm run lint` | `tsc --noEmit` strict type-check |
| `npm test` | Vitest run (jsdom + Testing Library + MSW) |

## Environment

`.env.example` ships dev-friendly defaults. Copy it to `.env` (or
`.env.local`) to override. Upper-env overrides are documented inline as
`# For staging/prod: ...` comments.

| Variable | Dev default | Upper-env |
|----------|-------------|-----------|
| `VITE_API_BASE_URL` | `http://localhost:4000` | BFF base URL |
| `VITE_USE_MSW` | `1` (offline mocks on) | `0` |
| `VITE_DEV_TOKEN` | `dev-token` | remove; use real auth |

## Key rules

- All BFF calls go through `apiClient` (`src/api/client.ts`) -- no raw `fetch()`, no axios.
- All user-facing strings go through `t('key')` -- keys live in `src/locales/en.json`.
- All design tokens come from `tailwind.config.js` (merged from `ui-style-outputs/`).
- Every route in `src/routes.tsx` MUST have a matching entry in `src/dev/route-inventory.ts`.
