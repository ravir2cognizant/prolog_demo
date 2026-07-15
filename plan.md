# Continuity — AI Knowledge Transfer Platform
*Build prompt for an AI coding tool (Claude Code, Cursor, v0, Lovable, bolt.new) or a product brief for a dev team.*

Build **Continuity** (working name — rename freely): a modern, enterprise-grade web platform that turns a project's raw artifacts — source code, documents, and recorded meetings — into structured, trustworthy knowledge: a high-level summary, a full knowledge-transfer document, a presentation, and flow/architecture diagrams.

## Current Implementation Snapshot

This section records what has been completed in the local initial setup after the original product brief was created.

### Branding

- The application branding has been updated from the original working name, Continuity, to **FIS**.
- The browser title, sidebar brand, export names, and visible product copy now use FIS naming.

### Main application files

| File | Purpose |
|---|---|
| `index.html` | Main FIS KT application shell with dashboard, sources, knowledge base, RAG chat, diagrams, presentation, and settings views |
| `styles.css` | Design token system, responsive layout, light/dark theme, status pills, upload zones, diagrams, presentation styles, and RAG chat styles |
| `app.js` | Frontend navigation, source state, simulated processing, graph interactions, exports, presentation controls, and RAG API calls |
| `rag_server.py` | Local FastAPI RAG backend for ZIP ingestion, source extraction, chunking, retrieval, and source-grounded chat |
| `rag_schema.sql` | PostgreSQL schema for PGAdmin-visible RAG tables |
| `fis-dolphin-kt-documentation.md` | Complete KT documentation for the FIS Dolphin application prototype |
| `image-project-kt-documentation.md` | Complete KT documentation for the Image Project and Process Documentation ZIP |
| `pgadmin-rag-setup.md` | PostgreSQL / PGAdmin setup guide for persisting the RAG index |
| `agents-kt-presentation.html` | HTML presentation explaining how agents create KT packages |
| `image-project-understanding-presentation.html` | HTML presentation summarizing the Image Project KT workspace |

### Running services

Static UI:

```powershell
cd C:\OSR\FIS\KTApp
python -m http.server 5173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173/index.html
```

RAG API:

```powershell
cd C:\OSR\FIS\KTApp
python rag_server.py
```

Open API status:

```text
http://127.0.0.1:8001/api/rag/status
```

Port `8000` was already occupied by another local service, so the RAG API defaults to `8001`.

### Workspaces implemented

#### Image Project KT

`Image Project KT` is now the default workspace.

Source attachment:

```text
C:\OSR\FIS\Image Project and Process Documentation (1) 1.zip
```

The ZIP contains 114 files under `Project Documents/`, grouped into 10 lifecycle folders:

| Folder | Count | Purpose |
|---|---:|---|
| `00. Administrative` | 9 | Role definitions, methodology, RACI, PlanView, CREQ workflow, training |
| `01. Management & Control` | 10 | Contracts, PlanView admin, project registration, governance, communication, RAG status |
| `02. Project Initiation` | 14 | Sales turnover, entity creation, resource request, kickoff, charter, project log, meeting minutes |
| `03. Definition & Design` | 48 | Business requirements, high-level scope, functional design, solution architecture, technical design, PIQs, test plan |
| `04. Executing, Unit Testing & Implementation` | 3 | Configuration, functional test worksheet, project plan updates |
| `05. Training` | 4 | Training plan, FIS Academy courses, Life of a Check, training schedule |
| `07. Testing` | 2 | Integrated / UAT test plan and initial testing acceptance |
| `09. Deployment & Go-Live` | 8 | Run book, playbook samples, readiness approval, go-live notice, issue tracker |
| `10. Closing` | 4 | Closure process, support handoff, completion approval, closure notification |
| `99. Miscellaneous Items` | 12 | Confidence playbooks, SNOW/CREQ guidance, audit, change control, cancellation, PlanView change request |

Generated knowledge for this workspace includes:

- High-level summary in the app Knowledge Base
- Structured KT document in `image-project-kt-documentation.md`
- Glossary and FAQ in the app Knowledge Base
- Diagram and presentation content in the app
- Standalone HTML summary deck in `image-project-understanding-presentation.html`
- RAG chat with source citations

#### FIS Dolphin

`FIS Dolphin` remains available as an additional workspace option.

Generated knowledge for this workspace includes:

- Structured KT documentation in `fis-dolphin-kt-documentation.md`
- Agent workflow presentation in `agents-kt-presentation.html`

### RAG implementation

The RAG implementation is local and source-grounded.

Backend:

- `rag_server.py`
- FastAPI service on `http://127.0.0.1:8001`
- CORS enabled for the static app
- Endpoints:
  - `GET /api/rag/status`
  - `POST /api/rag/ingest`
  - `POST /api/rag/chat`
  - `GET /api/rag/sources`

Extraction support:

- DOCX / DOCM
- PPTX
- XLSX / XLSM
- TXT
- EML / OFT
- Best-effort PDF string extraction
- Metadata fallback for formats that cannot yet be fully parsed

Current index result:

- 114 documents
- 1,388 chunks
- Current provider: in-memory fallback

PostgreSQL / PGAdmin 4:

- PostgreSQL is running locally on `127.0.0.1:5432`.
- PGAdmin 4 is installed with PostgreSQL 18.
- PostgreSQL persistence is implemented in `rag_schema.sql`, but database credentials were not available during setup.
- Current PostgreSQL blocker: `fe_sendauth: no password supplied`.
- Once credentials are configured, the RAG API will create/populate:
  - `rag_workspaces`
  - `rag_documents`
  - `rag_chunks`

### RAG chat behavior

The app includes a `RAG Chat` navigation item.

RAG Chat supports:

- API status checks
- Document ingestion
- Deep-dive questions
- Source-grounded answers
- Citation cards with source path, title, lifecycle phase, file type, chunk index, score, and snippet

Example tested question:

```text
Which documents support go-live readiness and run book planning?
```

The API returned citations from:

- `Project Documents/09. Deployment & Go-Live/09a.PM - Item Processing-Run Book (Post Production Support)-20260223.docx`
- `Project Documents/09. Deployment & Go-Live/09b.CA - Acquisition Playbook Sample.xlsx`

### Presentations created

Agent KT creation deck:

```text
http://127.0.0.1:5173/agents-kt-presentation.html
```

Image Project understanding deck:

```text
http://127.0.0.1:5173/image-project-understanding-presentation.html
```

### Current limitations and next steps

- Configure PostgreSQL credentials so RAG chunks can be persisted and inspected in PGAdmin 4.
- Add specialized extractors for `.msg`, `.mpp`, legacy `.xls`, and richer PDF parsing.
- Add an LLM synthesis layer after retrieval is validated.
- Add auth, workspace roles, audit history, retention controls, and multi-tenant isolation for production.
- Add automated UI and API regression tests.
- Replace simulated upload/processing states with real backend jobs.

## The problem it solves
When people, teams, or vendors change hands on a project, the knowledge that actually matters — why things were built a certain way, what's fragile, what got decided in a meeting six months ago — usually leaves with them. This tool captures it automatically instead of relying on someone writing it all down before they go.

## Who it's for
Engineering leads running a team handover, new hires ramping up on an unfamiliar codebase, consultants and auditors who need a fast and accurate picture of a system, and teams preparing for technical due diligence.

## What goes in → what comes out

| Input | What the AI pulls from it |
|---|---|
| **Source code** (repo connection or .zip) | Architecture style, tech stack, module structure, APIs, data models, dependency graph |
| **Documents** (PDF, DOCX, PPTX, MD, TXT) | Requirements, design decisions, historical context |
| **Recordings** (MP4, MP3, WAV, or a pasted meeting link) | Tribal knowledge, decisions, Q&A, action items — transcribed and speaker-diarized |

## Core user journey
1. **Create a project workspace.**
2. **Upload inputs** in any combination — connect a GitHub/GitLab/Bitbucket repo or drag in a .zip; drag-and-drop documents; upload recordings or paste a Zoom/Teams/Meet/Loom link.
3. **Watch processing happen** through a visible per-file pipeline: *Queued → Extracting → Analyzing → Cross-referencing → Ready.* Nothing should feel like a black box.
4. **Review the generated knowledge base**: High-Level Summary, Knowledge Transfer Document, Presentation, Diagrams — every section editable.
5. **Refine** — regenerate any section with optional instructions ("make this more technical," "add a section on the payments module"), leave comments, lock final versions.
6. **Export or share** — PDF, PPTX, DOCX, Markdown, a read-only link, or push to Confluence/Notion.

## What the AI engine actually has to produce

**1. High-level summary (1 page).** Purpose, tech stack, architecture style, ownership, current health, and the top risks or knowledge gaps.

**2. Structured Knowledge Transfer document**, with sections for: system overview, architecture and its rationale, local setup / "how to run this," key modules and what each owns, data model, APIs and integrations, business/domain rules (especially the ones only ever said out loud in a meeting), known issues and tech debt, deployment and infra, a glossary, and an FAQ built from what people actually asked and answered in the recordings. Wherever possible, cite sources inline — "(see `auth/login.ts`)" or "(discussed at 14:32 in the sprint walkthrough)" — that traceability is what makes people trust the document enough to use it.

**3. Auto-generated presentation** mirroring the KT doc at executive depth — one deck, editable slide by slide, with speaker notes drafted from what was actually said in the recordings. Exportable to PPTX.

**4. Flow and architecture diagrams**, generated from the real code and docs rather than generic templates: system architecture diagram, sequence diagrams for the most important flows, an entity-relationship diagram, and an end-to-end application/user-journey flow diagram. Rendered on a pannable, zoomable canvas; exportable as SVG/PNG.

**5. Cross-referencing** — the actual differentiator. Everything above should link together: a glossary term should point to the code that implements it and the moment in a recording where someone explained it. That's what separates this from "summarize each file separately."

## Look and feel
This has to read as considered enterprise software, not a templated AI-generated shell. Give it a real point of view rather than defaulting to the looks every AI design tool reaches for by default — a cream background with a terracotta accent, a near-black theme with a single acid-green accent, or a hairline-ruled "broadsheet" layout. Make a deliberate choice instead, suited to a tool whose whole job is trust and clarity:

- **A real token system, not vibes.** Define an actual palette (4–6 named values — a neutral base, an ink/text color, one confident accent, and calm status colors for processing/ready/error), a type pairing (a distinctive-but-professional display face for headers, a clean body face, and a monospace face for code references and technical labels — this is a developer-facing tool, so a monospace accent is on-brand rather than decorative), and one consistent spacing/radius scale. Derive every screen from those choices instead of styling ad hoc.
- **One real signature element.** The most distinctive thing this product does is link code, documents, and meeting moments together — so make that cross-reference view (an interactive knowledge graph or linked-citation panel) the visual centerpiece somewhere in the product, not just another card. Keep everything else quiet and disciplined around it.
- **Layout:** a persistent left sidebar (Projects → Dashboard, Sources, Knowledge Base, Diagrams, Presentation, Settings) and a slim top bar with global search, workspace switcher, and notifications.
- **Interface copy:** active voice, plain verbs, no filler. Name things by what the user controls ("Sources," "Team access"), not system internals ("webhook config"). A button and the toast it produces should share a verb — "Export" produces "Exported," not "Submission successful." Empty states should invite action ("Upload your first document," with a clear button); errors should explain what happened and how to fix it in a calm, specific voice — never vague, never apologetic.
- **States that need real design, not defaults:** drag-and-drop upload zones with genuine affordance; calm, color-coded status pills (Queued/Processing/Ready/Error); skeleton loaders instead of spinners for anything over a second; toasts for background jobs finishing so people can navigate away mid-process.
- **A floor, not a ceiling:** responsive down to a reasonable minimum width, visible keyboard focus, reduced motion respected, WCAG AA contrast, and both light and dark mode. This is desktop-first B2B software — optimize for laptop/desktop and degrade gracefully on tablet rather than chasing phone-first patterns.

## Suggested technical approach
*(Adapt freely to whatever platform or stack you're actually building on.)*

- **Frontend:** React/Next.js, Tailwind, a component library such as shadcn/ui, Mermaid or React Flow for diagrams, subtle motion via Framer Motion.
- **Backend:** Node/NestJS or Python/FastAPI, with a background job queue (BullMQ/Celery) for anything long-running — repo analysis, transcription, generation — so the UI is never blocked.
- **AI layer:** an LLM (e.g., Claude) for summarization, KT-doc drafting, and diagram-spec generation, plus a speech-to-text model with speaker diarization for recordings.
- **Storage:** S3-compatible object storage for raw files, Postgres for structured metadata, and optionally a vector store for semantic search across the knowledge base.
- **Auth:** OAuth/SSO (SAML for enterprise) with workspace-level roles (Owner/Editor/Viewer).

## Non-functional requirements that actually matter here
- Source code and recordings are sensitive IP — encrypt at rest and in transit, and make data retention/deletion controls visible rather than buried in settings.
- Processing is inherently asynchronous (large repos, hour-long recordings) — design around that reality with progress states and notifications instead of pretending it's instant.
- Version history and an audit trail on generated documents — enterprise buyers will ask for this.
- Real multi-tenancy from day one, with workspaces properly isolated.

## Definition of done for a first working version
- All three input types upload and process end-to-end for a real project.
- All four output types (summary, KT doc, presentation, diagrams) generate successfully and are editable.
- At least one export format works completely (PDF or PPTX).
- The dashboard, upload flow, and knowledge base views match the visual bar above — not placeholder styling.
