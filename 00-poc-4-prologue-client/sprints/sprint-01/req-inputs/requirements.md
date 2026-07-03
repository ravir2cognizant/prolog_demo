# Sprint-01 — Consolidated Requirements
Source: Journal Entry.png (Prologue Financials — General Ledger desktop application screenshot)
Produced by: A-01 Requirement Analyst
Date: 2026-05-23

---

## Overview
The source image shows the Prologue Financials desktop application with the General Ledger module
open on the Journal Entry Financial & Statistical screen. The POC ("Prologue Client") is to build
a modern web-based client (React SPA + BFF) that replicates this functionality.

The screen has two main areas:
1. A left-side hierarchical navigation menu listing all GL module functions.
2. A main content area showing a Journal Entry form with a header section and a line-items grid.

---

## User Story 1 — General Ledger Module Navigation Menu
Source: Journal Entry.png (left sidebar)

As a General Ledger accountant,
I want to navigate the GL module through a hierarchical left-side menu,
So that I can access any GL function quickly without leaving the application.

### Visible context (from image)
The left panel shows a tree-structure navigation with the following top-level nodes and sub-items:
- General Ledger (header)
  - Reports, Lookups
- Chartfield Processing
- Account Maintenance and Inquiry
- Journal Entry Financial & Statistical (currently active)
  - Two sub-items appear highlighted in a distinct colour (green) — likely notification/alert state
- Journal Entry Processing
  - Journal Entry Routing Process
  - GL Control / Administration
- Accruals/Projects
  - Allocation of Account Balances To Other
- Financial Report Designer
  - Editing Budget and import/export of Budget Data
  - Consolidation of GL Data From Multiple Databases
  - Import Transaction Download
- Fiscal Year / Period Control
- Import Transaction Download

### Acceptance criteria seen in source
- The active menu item (Journal Entry Financial & Statistical) is visually distinguished from inactive items.
- Some menu items appear in a highlighted/alert state (green-coloured text) — implies a notification or status indicator on individual menu items.
- The menu is collapsible/expandable (tree structure).

### Open ambiguities
- The two highlighted (green) sub-items under "Journal Entry Financial & Statistical" — their exact labels are partially visible. It is unclear whether the colour represents an alert (e.g. entries requiring action), a category, or a navigation state. Requires clarification.

---

## User Story 2 — View Journal Entry Header
Source: Journal Entry.png (header form, right pane)

As a General Ledger accountant,
I want to view the full header details of a journal entry,
So that I can review the entry's metadata, status, and context before examining its line items.

### Visible context (from image)
Header fields visible:
- Company ID (shows "0004 - 0004_company" — multi-company support implied)
- Journal Entry Type (shows "Finance Journal" — type dropdown)
- Journal Number (shows "237" — numeric identifier)
- Status (shows "Unposted" — entry lifecycle state)
- Transaction Date (shows "2/9/2011")
- Edit Date/Time (shows "2/10/2011 06:27:58" — system-populated audit timestamp)
- Auto Reversal Date (empty — optional field)
- Edit User ID (shows "User1" — system-populated from session)
- Description (shows "SM_desc" — free text label for the entry)
- Posting Session (empty — optional grouping field)
- Source Document (icon present — attachment/link capability)
- GL Import: "Import()" link
- Allocation Method ID (empty — optional)
- Balanced (shows "No" — see ambiguity OQ-001 below)
- Posted Date/Time (empty — populated on posting)
- Poster User ID (shows "User1" — system or manual)

### Acceptance criteria seen in source
- All header fields are displayed in a structured two-column layout.
- System-populated fields (Edit Date/Time, Edit User ID) are visible and read-only.
- Empty optional fields are shown as blank (not hidden).
- Status is displayed prominently ("Unposted").

### Open ambiguities
- OQ-001: The "Balanced" field shows "No" even though the line-items grid totals show Debit = Credit = $1,435 and Difference = $0.00. It is unclear whether "Balanced" is: (a) a user-settable flag independent of the mathematical balance, (b) a system flag that has not yet been recalculated, or (c) the entry truly has unbalanced items not visible in the screenshot. Resolution needed before implementing balance logic.
- OQ-002: The "Poster User ID" field shows "User1" on an Unposted entry. It is unclear whether this is pre-populated from the session or set only upon posting. Clarification needed to determine field population rules.
- OQ-003: "Posting Session" — purpose and valid values are not evident from the screenshot alone. Clarification needed.

---

## User Story 3 — Create / Edit Journal Entry Header
Source: Journal Entry.png (editable form fields visible)

As a General Ledger accountant,
I want to create a new journal entry or edit an existing unposted entry by entering header information,
So that I can record or correct the metadata for a financial transaction.

### Visible context (from image)
The form appears to be in view/edit mode (fields show values). An editable toolbar is visible at the
top with navigation and save/action icons, implying standard record CRUD operations.
- Company ID: dropdown selection
- Journal Entry Type: dropdown selection
- Transaction Date: date field (implied date-picker)
- Description: free-text field
- Auto Reversal Date: optional date field
- Allocation Method ID: optional field
- Source Document: attach/link capability

### Acceptance criteria seen in source
- User can select Company ID from a dropdown.
- User can select Journal Entry Type from a dropdown.
- User can enter/edit Description as free text.
- User can set a Transaction Date.
- Auto Reversal Date is optional.

### Open ambiguities
- OQ-004: It is unclear whether all fields are editable or whether some become read-only after first save. In particular, Company ID and Journal Entry Type may be locked after creation.
- OQ-005: Are there mandatory fields that block save if empty? The source does not show validation error states.

---

## User Story 4 — Journal Entry Line Items Management
Source: Journal Entry.png (lines grid)

As a General Ledger accountant,
I want to add, view, and manage individual debit and credit line items on a journal entry,
So that I can record the full double-entry detail of a financial transaction against specific GL accounts.

### Visible context (from image)
Grid columns (left to right):
- Line # (sequential)
- Edit icon (row-level action)
- Account (chartfield combination code, e.g. "1-098-1680-098-86")
- Account Description (auto-populated from account, e.g. "Account 74619029086")
- Currency ID (e.g. "USD")
- Debit (numeric amount)
- Credit (numeric amount)
- Description (per-line free text)
- Reference # (per-line reference code)

Three lines visible. Grid footer shows:
- Total row: sum of all Debit and Credit columns
- Difference row: Debit total minus Credit total (should be $0.00 for a balanced entry)

Grid action buttons visible at bottom (add line, delete line implied).

### Acceptance criteria seen in source
- Each line shows: line number, account code, account description, currency, debit, credit, description, reference.
- Account description is auto-populated when an account code is entered.
- The grid footer always shows running Debit total, Credit total, and Difference.
- A line can be either a debit or credit (not both simultaneously).

### Open ambiguities
- OQ-006: The chartfield code structure ("1-098-1680-098-86") has 5 segments separated by dashes. The meaning of each segment is not evident from the screenshot. This will need clarification for validation rules (e.g. valid segment values, lookup behaviour).
- OQ-007: Currency ID — is multi-currency supported, or is USD the only valid value for this entry type? The source shows only USD.
- OQ-008: Can lines be reordered, or is the sequence fixed by entry order?

---

## User Story 5 — Journal Entry Balance Validation
Source: Journal Entry.png (grid footer — Total and Difference rows)

As a General Ledger accountant,
I want to see real-time running totals of debits and credits with a difference indicator,
So that I can identify and correct any imbalance before submitting the journal entry for posting.

### Visible context (from image)
Grid footer shows:
- "Total" row: Debit $1,435.00 | Credit $1,435.00
- "Difference" row: $0.00 (balanced in this example)

Header shows "Balanced: No" — see OQ-001 above.

### Acceptance criteria seen in source
- Total debit and total credit are always visible at the bottom of the line-items grid.
- Difference (Debit total − Credit total) is always displayed.
- When Difference = $0.00, the entry is mathematically balanced.

---

## User Story 6 — Journal Entry Status and Audit Trail
Source: Journal Entry.png (Status, Edit Date/Time, Edit User ID, Posted Date/Time, Poster User ID)

As a General Ledger accountant,
I want to see the current status of a journal entry along with who edited or posted it and when,
So that I can track the audit trail and lifecycle of financial transactions.

### Visible context (from image)
- Status: "Unposted" (visible on the header)
- Edit Date/Time: auto-populated timestamp of last edit
- Edit User ID: auto-populated from session
- Posted Date/Time: empty (populated on posting)
- Poster User ID: User1 (see OQ-002)

Implied lifecycle: Unposted → Posted (one-way; no "Rejected" or intermediate states visible).

### Acceptance criteria seen in source
- Status is always visible on the header.
- Edit timestamps and user are system-generated and read-only.
- Post timestamps and user are empty until the entry is posted.

### Open ambiguities
- OQ-009: Are there more status values beyond Unposted/Posted (e.g. Rejected, In Review, Reversed)? The source shows only one status value.

---

## User Story 7 — Record Navigation (First / Previous / Next / Last)
Source: Journal Entry.png (toolbar navigation arrows)

As a General Ledger accountant,
I want to navigate between journal entries using First, Previous, Next, and Last controls,
So that I can browse entries sequentially without performing a separate search each time.

### Visible context (from image)
Top toolbar shows navigation arrow icons (standard first/prev/next/last pattern) alongside other
action icons (save, search, attachment, star/favourite).

### Acceptance criteria seen in source
- Four navigation controls: First, Previous, Next, Last.
- Navigating loads the corresponding journal entry into the header form and line-items grid.

### Open ambiguities
- OQ-010: Is navigation within the current company only, or across all companies? Behaviour at the boundaries (first/last record) is not shown.

---

## User Story 8 — Company and Entity Context Selection
Source: Journal Entry.png (Company ID field — "0004 - 0004_company")

As a General Ledger accountant,
I want to select the company/entity context for a journal entry,
So that transactions are recorded against the correct organisational entity.

### Visible context (from image)
- Company ID field shows "0004 - 0004_company" — implies a code + name format with dropdown selection.
- Multi-company system implied (code prefix "0004" suggests multiple company codes exist).

### Acceptance criteria seen in source
- Company ID is selectable from a dropdown.
- The display shows both the company code and name.

---

## User Story 9 — Source Document Reference
Source: Journal Entry.png (Source Document field with icon)

As a General Ledger accountant,
I want to attach or reference a source document to a journal entry,
So that the transaction has supporting documentation for audit and compliance purposes.

### Visible context (from image)
A "Source Document" field is present in the header with an attachment/link icon.
The field appears to hold a reference or allow an attachment.

### Acceptance criteria seen in source
- A source document can be linked or referenced on the journal entry header.
- The field is visible in the header layout.

### Open ambiguities
- OQ-011: Is this a file upload, a text reference code, or a link to another system record? The icon suggests file attachment, but the field type is unclear.

---

## User Story 10 — GL Import
Source: Journal Entry.png ("GL Import" / "Import()" link in header)

As a General Ledger accountant,
I want to import journal entry data from an external source via a GL Import function,
So that I can bulk-load transactions without manual line-by-line entry.

### Visible context (from image)
"GL Import: Import()" appears as a clickable link in the journal entry header area.

### Open ambiguities
- OQ-012: The import mechanism, supported file formats, and scope (header only vs header + lines) are not visible in the screenshot. This user story needs further clarification before design.

---

## Open Ambiguities Summary
| ID     | Source Field         | Question                                                                             | Status |
|--------|----------------------|--------------------------------------------------------------------------------------|--------|
| OQ-001 | Balanced: No         | "Balanced: No" while grid shows balanced totals — what does this field truly represent? | Open   |
| OQ-002 | Poster User ID       | Pre-populated on unposted entry — population rule unclear                             | Open   |
| OQ-003 | Posting Session      | Purpose and valid values not evident from screenshot                                  | Open   |
| OQ-004 | Editable fields      | Which header fields become read-only after initial save?                               | Open   |
| OQ-005 | Mandatory fields     | Which fields are mandatory (block save if empty)?                                      | Open   |
| OQ-006 | Chartfield structure | 5-segment code format — segment meaning and validation rules unclear                   | Open   |
| OQ-007 | Currency ID          | Multi-currency support or USD-only?                                                   | Open   |
| OQ-008 | Line reordering      | Can line items be reordered after entry?                                               | Open   |
| OQ-009 | Status values        | Are there more statuses beyond Unposted/Posted?                                        | Open   |
| OQ-010 | Navigation scope     | Record navigation — within company only or cross-company?                              | Open   |
| OQ-011 | Source Document type | File upload, text reference, or system link?                                          | Open   |
| OQ-012 | GL Import mechanism  | File format, scope, and trigger behaviour for import function                          | Open   |
