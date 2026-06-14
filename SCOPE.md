# SCOPE.md — JointSettle Project Analysis

## 1. CSV Data Anomaly Analysis

### 1.1 Overview

The JointSettle application includes a **CSV import feature** (`src/trpc/routers/groups/expenses/importCsv.procedure.ts`) that allows users to upload expense data from CSV files. The feature supports the app's own export format as well as flexible column naming conventions.

**No CSV files were found in the repository** at the time of analysis. The CSV import functionality exists as code but has not been executed against any actual data files. The following analysis describes the anomalies that the import logic is designed to detect and handle, based on a thorough review of the implementation.

### 1.2 Anomaly Detection & Handling Matrix

| Anomaly Type | Detection Method | Handling | Code Location |
|---|---|---|---|
| **Missing date** | Check for empty `date` field in row | Row is skipped, error recorded | Line 102 |
| **Invalid date string** | `new Date(dateStr)` returns `NaN` | Row is skipped, error recorded | Line 106 |
| **Missing or short title** | `title.length < 2` after trim | Row is skipped, error recorded | Line 112 |
| **Invalid or zero amount** | `parseFloat()` returns `NaN` or value ≤ 0 | Row is skipped, error recorded | Line 116 |
| **Empty CSV file** | `parsed.data.length === 0` | `TRPCError` with `BAD_REQUEST` status thrown | Line 76 |
| **Participant column not found in group** | Name match against `group.participants` fails | Column value skipped, error recorded, remaining columns still processed | Line 155 |
| **No payer identified** | No column has positive value after processing all participant columns | First participant with data is assumed as payer | Line 183 |
| **No participants in group** | `group.participants.length === 0` | Row is skipped, error recorded | Line 191 |
| **No paid-for entries** | No participant columns found and no group participants | Row is skipped, error recorded | Line 198 |
| **Unparseable row** | Exception thrown during processing | Row is skipped, error message captured | Lines 212-214 |
| **Non-numeric participant values** | `parseFloat()` returns `NaN` | Column is silently skipped | Line 150 |
| **Category name mismatch** | Category name not found in database | Falls back to category ID 0 (General) | Line 124 |
| **Unrecognized split mode** | Label doesn't match known export format values | Defaults to `EVENLY` | Line 130 |

### 1.3 Data Assumptions

The CSV import logic makes the following assumptions about input data:

1. **CSV has a header row** — The import uses `Papa.parse` with `header: true`, so the first row is assumed to contain column names.
2. **Participant columns are the last columns** — After known system columns (Date, Description, Category, Cost, etc.), remaining columns are treated as participant names.
3. **Positive values = payer** — The participant column with a positive value is the person who paid. All other participants have negative values (what they owe).
4. **Amounts are in decimal form** — CSV amounts are in standard decimal notation (e.g., `25.50`), which the importer converts to minor units (cents) using the group's currency decimal digits.
5. **Participants in CSV match group participants by name** — Column names (participant names) are matched case-insensitively against existing group participants.
6. **Dates are parseable** — Any string that `new Date()` can parse is accepted as a valid date.
7. **UTF-8 BOM is handled** — The export adds a BOM (`\uFEFF`), but PapaParse handles this transparently.
8. **Even split fallback** — If no participant columns are detected, the expense is split evenly among all group participants.

### 1.4 Column Flexibility

The import normalizes column headers using a mapping of common aliases:

| Accepted Inputs | Normalized To |
|---|---|
| `date` | `date` |
| `description`, `title` | `title` |
| `category` | `category` |
| `cost`, `amount` | `amount` |
| `original cost`, `original amount` | `originalCost` |
| `original currency` | `originalCurrency` |
| `conversion rate`, `rate` | `conversionRate` |
| `is reimbursement`, `reimbursement` | `isReimbursement` |
| `split mode`, `split` | `splitMode` |

---

## 2. Database Schema Documentation

### 2.1 Entity Relationship Diagram (Textual)

```
User (1) ─────< (N) Group
Group (1) ────< (N) Participant
Group (1) ────< (N) Expense
Group (1) ────< (N) Activity
Category (1) ──< (N) Expense
Participant (1) ─< (N) Expense     [as paidBy]
Participant (1) ─< (N) ExpensePaidFor
Expense (1) ────< (N) ExpensePaidFor
Expense (1) ────< (N) ExpenseDocument
Expense (1) ──── (0..1) RecurringExpenseLink
Expense (1) ──── (0..1) RecurringExpenseLink [as currentFrameExpense]
```

### 2.2 Models

#### User
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id` | Auto-generated nanoid |
| `hash` | `String` | `@unique` | 8-char alphanumeric access key |
| `createdAt` | `DateTime` | `@default(now())` | Account creation timestamp |
| `groups` | `Group[]` | Relation | Groups owned by this user |

**Relationships:**
- One-to-many with `Group` via `userId`

---

#### Group
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id` | Auto-generated nanoid |
| `name` | `String` | Required | Group display name |
| `information` | `String?` | `@db.Text` | Optional group description |
| `currency` | `String` | `@default("$")` | Currency symbol |
| `currencyCode` | `String?` | Nullable | ISO-4217 currency code (e.g., "USD") |
| `userId` | `String` | Required | Foreign key to User |
| `createdAt` | `DateTime` | `@default(now())` | Group creation timestamp |

**Indexes:**
- `@@index([userId])` — Optimized user group lookup

**Relationships:**
- Many-to-one with `User` via `userId` (Cascade delete)
- One-to-many with `Participant` via `groupId` (Cascade delete)
- One-to-many with `Expense` via `groupId` (Cascade delete)
- One-to-many with `Activity` via `groupId` (Cascade delete)

---

#### Participant
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id` | Auto-generated nanoid |
| `name` | `String` | Required | Display name |
| `groupId` | `String` | Required | Foreign key to Group |

**Relationships:**
- Many-to-one with `Group` via `groupId` (Cascade delete)
- One-to-many with `Expense` via `paidById` (as "expensesPaidBy")
- One-to-many with `ExpensePaidFor` via `participantId` (as "expensesPaidFor")

---

#### Category
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Numeric ID |
| `grouping` | `String` | Required | Category group (e.g., "Housing") |
| `name` | `String` | Required | Category name (e.g., "Rent") |

**Seeded Data:** 101 categories across 12 groupings (General, Payment, Housing, Transportation, Food & Dining, Shopping, Entertainment, Travel, Healthcare, Education, Income, Donation).

**Relationships:**
- One-to-many with `Expense` via `categoryId`

---

#### Expense
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id` | Auto-generated nanoid |
| `groupId` | `String` | Required | Foreign key to Group |
| `expenseDate` | `DateTime` | `@db.Date` | Date of expense |
| `title` | `String` | Required | Description |
| `categoryId` | `Int` | `@default(0)` | Foreign key to Category |
| `amount` | `Int` | Required | Monetary amount in minor units (cents) |
| `originalAmount` | `Int?` | Nullable | Original amount in foreign currency (cents) |
| `originalCurrency` | `String?` | Nullable | ISO-4217 code of original currency |
| `conversionRate` | `Decimal?` | Nullable | Exchange rate used |
| `paidById` | `String` | Required | Foreign key to Participant (who paid) |
| `isReimbursement` | `Boolean` | `@default(false)` | Whether this is a settlement payment |
| `splitMode` | `SplitMode` | `@default(EVENLY)` | Enum: EVENLY, BY_SHARES, BY_PERCENTAGE, BY_AMOUNT |
| `createdAt` | `DateTime` | `@default(now())` | Record creation timestamp |
| `notes` | `String?` | Nullable | Optional notes |
| `recurrenceRule` | `RecurrenceRule?` | `@default(NONE)` | DAILY, WEEKLY, MONTHLY, or NONE |
| `recurringExpenseLinkId` | `String?` | Nullable | Foreign key to RecurringExpenseLink |

**Relationships:**
- Many-to-one with `Group` via `groupId` (Cascade delete)
- Many-to-one with `Category` via `categoryId`
- Many-to-one with `Participant` via `paidById` (Cascade delete)
- One-to-many with `ExpensePaidFor` via `expenseId` (Cascade delete)
- One-to-many with `ExpenseDocument` via `expenseId`
- One-to-one with `RecurringExpenseLink` via `recurringExpenseLinkId`

---

#### ExpensePaidFor (Join Table)
| Field | Type | Constraints | Description |
|---|---|---|---|
| `expenseId` | `String` | Composite PK | Foreign key to Expense |
| `participantId` | `String` | Composite PK | Foreign key to Participant |
| `shares` | `Int` | `@default(1)` | Split value based on mode |

**Composite Primary Key:** `@@id([expenseId, participantId])`

**Relationships:**
- Many-to-one with `Expense` via `expenseId` (Cascade delete)
- Many-to-one with `Participant` via `participantId` (Cascade delete)

---

#### ExpenseDocument
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id` | Auto-generated nanoid |
| `url` | `String` | Required | S3 or external URL |
| `width` | `Int` | Required | Image width in pixels |
| `height` | `Int` | Required | Image height in pixels |
| `expenseId` | `String?` | Nullable | Foreign key to Expense |

**Relationships:**
- Many-to-one with `Expense` via `expenseId`

---

#### Activity
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id` | Auto-generated nanoid |
| `groupId` | `String` | Required | Foreign key to Group |
| `time` | `DateTime` | `@default(now())` | Action timestamp |
| `activityType` | `ActivityType` | Required | Enum: UPDATE_GROUP, CREATE_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE |
| `participantId` | `String?` | Nullable | Who performed the action |
| `expenseId` | `String?` | Nullable | Which expense was affected |
| `data` | `String?` | Nullable | Additional context (e.g., expense title) |

**Relationships:**
- Many-to-one with `Group` via `groupId` (Cascade delete)

---

#### RecurringExpenseLink
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `String` | `@id` | Auto-generated nanoid |
| `groupId` | `String` | Required | Group identifier |
| `currentFrameExpenseId` | `String` | `@unique` | Foreign key to the source Expense |
| `nextExpenseCreatedAt` | `DateTime?` | Nullable | When the next instance was created |
| `nextExpenseDate` | `DateTime` | Required | Scheduled date for next instance |

**Indexes:**
- `@@index([groupId])`
- `@@index([groupId, nextExpenseCreatedAt, nextExpenseDate(sort: Desc)])`

---

### 2.3 Enumerations

| Enum | Values | Description |
|---|---|---|
| `SplitMode` | `EVENLY`, `BY_SHARES`, `BY_PERCENTAGE`, `BY_AMOUNT` | Expense distribution method |
| `RecurrenceRule` | `NONE`, `DAILY`, `WEEKLY`, `MONTHLY` | Recurrence frequency |
| `ActivityType` | `UPDATE_GROUP`, `CREATE_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE` | Activity log categories |

---

## 3. Key Architectural Decisions

### 3.1 Monetary Amount Storage

All monetary amounts are stored as **integers in minor units** (cents). For example, $25.50 is stored as `2550`. This avoids floating-point rounding errors in financial calculations.

**Conversion functions** are located in `src/lib/utils.ts`:
- `amountAsMinorUnits(value, currency)` — Converts decimal to minor units
- `amountAsDecimal(value, currency)` — Converts minor units back to decimal
- `formatCurrency(currency, amount, locale)` — Formats for display

### 3.2 Balance Calculation Engine

The balance engine (`src/lib/balances.ts`) processes expenses to produce per-participant totals:
- `paid` — Total amount this person has paid
- `paidFor` — Total amount this person owes (their share of all expenses)
- `total = paid - paidFor` — Net balance (positive = owed money, negative = owes money)

The reimbursement algorithm greedily pairs the largest creditor with the largest debtor, producing a minimal set of suggested transfers.

### 3.3 Rounding Strategy

Rounding is handled at the per-participant level using a **last-participant-gets-remainder** strategy. For each expense, the last participant in the split receives whatever remains after distributing to all others, ensuring the total always balances to zero.

### 3.4 Audit Trail

All expense mutations (create, update, delete) and group changes are recorded in the `Activity` table. This provides a full audit trail visible in the Activity tab of each group, showing who performed which action and when.

---

## 4. Assignment Requirements Check

| Requirement | Status | Notes |
|---|---|---|
| Login module | ✅ Complete | Hash-based auth with signup/login pages |
| Group management with changing membership | ✅ Complete | Join/leave flow + edit group participants |
| Expenses with all split types | ✅ Complete | 4 split modes supported |
| Group balances and individual summaries | ✅ Complete | Balances page with per-person breakdowns |
| Settle debts / record payments | ✅ Complete | Reimbursements tab with "Mark as Paid" |
| Import expenses CSV | ✅ Complete | tRPC procedure + UI dialog implemented |
| Relational DB only | ✅ Complete | PostgreSQL via Prisma |
| CSV file analysis (anomalies) | ⚠️ Documented | Import logic exists; no actual CSV files to analyze in repo |
| Import report | ⚠️ Documented | Feature is ready; no import history exists |
