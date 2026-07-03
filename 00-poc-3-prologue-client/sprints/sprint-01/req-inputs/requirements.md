# Requirements -- Sprint 01: Prologue Client MVP
# Produced by: A-01 Requirement Analyst
# Source: sprints\sprint-01\req-inputs\Journal Entry.png
# Date: 2026-05-21
# Status: Consolidated from raw image input

---

## Source Analysis

Single input file: `Journal Entry.png`
Application visible: **Prologue Financials** -- General Ledger module
Screen visible: **Journal Entry** form (Windows-style legacy UI)
Project context: Building a modern web client (React + BFF) for the Prologue Financials GL module.

---

## User Story 1 -- Journal Entry Header Creation and Editing
Source: Journal Entry.png (main form header section)

As a GL accountant,
I want to create and edit a journal entry header with all required fields (Company ID, Entry Type, Transaction Date, Description, Source Document, Allocation Method, Routing),
So that I can accurately set up a journal entry before adding financial lines.

### Visible context (from image)
Header fields: Company ID (dropdown: 0004 - 0004_company), Journal Entry Type (dropdown: Finance Journal),
Journal Entry ID (auto/manual: 237), Transaction Date (2/8/2011), Auto Reversal Date (empty),
Description (text: del_desc), Source Document (dropdown: GL Import), Allocation Method ID (dropdown),
Routing (text field), Posted (Yes/No).

### Acceptance criteria seen in source
Entry status shown as Unposted until posted. Edit Date/Time and User captured automatically.

---

## User Story 2 -- Journal Entry Lines Management
Source: Journal Entry.png (lines grid)

As a GL accountant,
I want to add, edit, and delete journal entry lines specifying the account, currency, debit amount, credit amount, description, and reference number for each line,
So that I can record the full double-entry accounting transaction.

### Visible context (from image)
Grid columns: Line #, Account (with picker icon), Account Description (auto-populated), Currency ID, Debit, Credit, Description, Reference #.
3 lines visible. Lines use account codes like 1-394-7005-008-96 with descriptions auto-filled.

### Acceptance criteria seen in source
Each line has independent debit or credit; the system auto-fills the account description from the account code.

---

## User Story 3 -- Debit/Credit Balance Validation and Totals
Source: Journal Entry.png (totals row at bottom of grid)

As a GL accountant,
I want to see a running total of all debits, credits, and the difference across all journal entry lines,
So that I can confirm the entry is balanced (Difference = $0.00) before saving or posting.

### Visible context (from image)
Totals row shows: Total Debit $1,825.00 | Total Credit $1,825.00 | Difference $0.00.
Row is separate from the data lines, displayed at the bottom of the grid.

### Acceptance criteria seen in source
When debits equal credits, Difference shows $0.00.

---

## User Story 4 -- Journal Entry Status and Posting Control
Source: Journal Entry.png (Status field, Posted field, Posted Date/Time, Posted User ID)

As a GL supervisor,
I want to post or unpost a journal entry and have the system record when and by whom it was posted,
So that I can control which entries are included in the general ledger balances.

### Visible context (from image)
Status field shows "Unposted". Posted field shows "No". Posted Date/Time and Posted User ID fields present.

---

## User Story 5 -- Journal Entry Auto-Reversal
Source: Journal Entry.png (Auto Reversal Date field)

As a GL accountant,
I want to set an auto-reversal date on a journal entry,
So that the system automatically creates the reversing entry in the specified future period, reducing manual period-end work.

### Visible context (from image)
"Auto Reversal Date" field is present in the header, currently empty for entry #237.

### Acceptance criteria seen in source
Field accepts a date; when set, an automated reversal is implied.

---

## User Story 6 -- Journal Entry Navigation and Record Browsing
Source: Journal Entry.png (navigation toolbar)

As a GL accountant,
I want to navigate through journal entries using first/previous/next/last controls,
So that I can browse, review, and select entries without returning to a separate search screen.

### Visible context (from image)
Toolbar has navigation icons: First, Previous, Next, Last (standard record navigation pattern).

---

## User Story 7 -- Journal Entry Edit Audit Trail
Source: Journal Entry.png (Edit Date/Time and Edit User ID fields)

As a GL auditor,
I want to see who last edited a journal entry and when the edit occurred,
So that I have a reliable audit trail of all changes to GL entries.

### Visible context (from image)
Fields: Edit Date/Time (2/10/2011 09:27:49) and Edit User ID (User1).

---

## User Story 8 -- Journal Entry Routing and Approval Workflow
Source: Journal Entry.png (Routing field in header; "Journal Entry Routing Process" in left nav)

As a GL supervisor,
I want to route journal entries through a configurable approval workflow before posting,
So that entries are reviewed and approved by authorized personnel in accordance with internal controls.

### Visible context (from image)
Header has a "Routing" field. Left nav shows "Journal Entry Routing Process" as a separate module with "GL Control" and administration settings sub-items.

---

## User Story 9 -- Journal Entry Financial Review
Source: Journal Entry.png (left nav: "Journal Entry Financial Review")

As a financial manager,
I want to review journal entries for financial accuracy and compliance before period close,
So that I can ensure the GL reflects correct financial data and identify any errors before reporting.

### Visible context (from image)
Left nav shows "Journal Entry Financial Review" with sub-items (partially visible, appear to be filtering/display options).

---

## User Story 10 -- Accruals and Prepaid Journal Entry Management
Source: Journal Entry.png (left nav: "Accruals/Prepaid")

As a GL accountant,
I want to create and manage accrual and prepaid journal entries with their associated reversal schedules,
So that I can accurately record period-end accruals and prepaid expenses that span multiple accounting periods.

### Visible context (from image)
"Accruals/Prepaid" appears as a distinct module in the General Ledger left navigation.

---

## User Story 11 -- Account Balance Allocation
Source: Journal Entry.png (left nav: "Allocation of Account Balances To Other Accounts")

As a GL accountant,
I want to allocate account balances to other accounts based on defined allocation rules (by amount or percentage),
So that I can distribute shared costs, overheads, or revenues across multiple departments or cost centres.

### Visible context (from image)
"Allocation of Account Balances To Other Accounts" in left nav. Appears to support amount-based and percentage-based allocation rules. References "Fx, 4/5, or 5/6" (likely allocation basis/ratio options -- exact meaning unclear, flagged as open question).

---

## User Story 12 -- Financial Report Designer
Source: Journal Entry.png (left nav: "Financial Report Designer")

As a financial reporting manager,
I want to design and run custom financial reports (financial statements, analysis reports) based on GL data and allocated amounts,
So that I can produce the financial reports required by management and regulatory bodies.

### Visible context (from image)
"Financial Report Designer" in left nav with a note about "financial statements, analysis based on allocated amounts defined."

---

## User Story 13 -- Budget Import and Export
Source: Journal Entry.png (left nav: "Editing Budgets and Import/Exports of Budget Data")

As a finance manager,
I want to edit budget data and import or export it in bulk,
So that I can maintain the GL budget data and synchronise it with external budget planning tools.

### Visible context (from image)
"Editing Budgets and Import/Exports of Budget Data" in left nav.

---

## User Story 14 -- GL Data Consolidation from Multiple Databases
Source: Journal Entry.png (left nav: "Import/Consolidation of GL Data From Multiple Databases")

As a group finance manager,
I want to import and consolidate GL data from multiple entity databases into a single consolidated view,
So that I can produce group-level financial reports from consolidated data.

### Visible context (from image)
"Import/ Consolidation of GL Data From Multiple Databases" in left nav with note "reporting from a consolidation database."

---

## User Story 15 -- Fiscal Year and Accounting Period Control
Source: Journal Entry.png (left nav: "Fiscal Year / Period Control")

As a finance administrator,
I want to open and close fiscal years and accounting periods,
So that I can control which periods are available for journal entry posting and prevent accidental posting to closed periods.

### Visible context (from image)
"Fiscal Year / Period Control" in left nav.

---

## User Story 16 -- Transaction Import and Download
Source: Journal Entry.png (left nav: "Import Transaction Download")

As a GL accountant,
I want to import transaction data from external systems (download/import),
So that I can load transactions from sub-ledgers or third-party systems into the GL without manual re-entry.

### Visible context (from image)
"Import Transaction Download" in left nav.

---

## User Story 17 -- Account Maintenance and Inquiry
Source: Journal Entry.png (left nav: "Account Maintenance and Inquiry")

As a GL administrator,
I want to create, edit, and look up GL accounts,
So that I can maintain the chart of accounts and ensure accountants can find the correct account codes when creating journal entries.

### Visible context (from image)
"Account Maintenance and Inquiry" in left nav. The Journal Entry lines use account code picker (visible icon) suggesting accounts are maintained in a separate master record.

---

## Open Ambiguities

- [Journal Entry.png]: What does "Allocation Method ID" in the JE header reference? Is it a link to an allocation rule set up elsewhere in the system?
- [Journal Entry.png]: What are the valid Journal Entry Types (only "Finance Journal" visible)?
- [Journal Entry.png]: What does "Unallocated Processing" (first left nav item) mean exactly? Is this a queue of unprocessed allocation items?
- [Journal Entry.png]: In the Account Balance Allocation section, "Fx, 4/5, or 5/6" references are partially visible -- exact meaning and options are unclear.
- [Journal Entry.png]: What is the maximum number of journal entry lines allowed?
- [Journal Entry.png]: Are multi-currency journal entries supported (only USD visible; is the Currency ID field per-line)?
- [Journal Entry.png]: What permissions/roles govern who can post, approve, or route entries?
- [Journal Entry.png]: Is the Journal Entry ID auto-generated or manually entered?
- [Journal Entry.png]: What triggers the "Auto Reversal" -- is it a scheduled job or manual action?
- [Journal Entry.png]: What does the Routing field contain -- a routing code, a user, or a workflow step name?
