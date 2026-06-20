# JointSettle — Share Expenses with Friends & Family

**JointSettle** is a minimalist, open-source web application for splitting expenses among groups of people. It is designed as a privacy-conscious alternative to Splitwise or Tricount — no email required, no personal data collected, and full control over your group finances.

---

## Features

### Core Functionality

- **Hash-based Authentication** — No email, password, or OAuth. Users receive a unique 8-character alphanumeric hash that serves as their identity. Create one at signup, store it locally, and use it to access your groups from any device.
- **Group Management** — Create groups with custom names, descriptions, and currencies. Add or remove participants at any time.
- **Join / Leave Groups** — Users can independently join a group via a shared link by entering their display name. Participants can leave groups (provided they have no outstanding expenses).
- **Expense Tracking** — Record expenses with title, date, amount, category, and optional notes.
- **Four Split Modes**:
  - **Evenly** — Divide the total equally among selected participants.
  - **By Shares** — Each participant gets a custom number of shares (e.g., 2:1:1).
  - **By Percentage** — Split by percentages that must sum to 100%.
  - **By Amount** — Each participant pays a specific amount summing to the total.
- **Reimbursements** — Suggested settlement payments calculated automatically from balances. Mark as paid with a single click to create a reimbursement expense.
- **Multi-Currency Support** — Expenses can be recorded in any currency with live exchange rate conversion via the Frankfurter API.
- **Recurring Expenses** — Set expenses to repeat daily, weekly, or monthly. The system automatically creates new instances on the scheduled dates.
- **100+ Expense Categories** — 12 category groupings (Housing, Transportation, Food & Dining, Shopping, Entertainment, Travel, Healthcare, Education, Income, Donation, General, Payment) with icons.
- **Activity Feed** — Every create, update, and delete action is logged with timestamps and participant attribution.
- **AI-Powered Receipt Scanning** — Upload a photo of a receipt; AI extracts the title, amount, date, and category (requires OpenAI API key).
- **AI Category Extraction** — When typing an expense title, AI suggests the most relevant category (requires OpenAI API key).
- **Expense Documents / Receipts** — Attach images to expenses via S3-compatible storage.
- **CSV Export & Import** — Export expenses as CSV or JSON. Import expenses from a CSV file with **dual-mode auto-detection** — supports both the app's export format AND the assignment CSV format (`date,description,paid_by,amount,currency,split_type,split_with,split_details,notes`). Auto-detects 24 anomaly types with structured reporting.
- **Import Reports** — Each CSV import generates a persistent report with full anomaly details. View at `/groups/[groupId]/imports/[importId]` or download as JSON.
- **Anomaly Detection** — 24 anomaly scenarios detected and classified by severity (`error`/`warning`/`info`) and action (`skipped`/`auto-fixed`/`flagged`). Includes duplicate detection, date ambiguity handling, thousand-separator stripping, settlement detection from notes, and time-based membership validation.
- **Balance Drill-Down** — Click any balance card to see which expenses contribute to it, sorted by date, with per-expense contribution amounts.
- **Member Timeline** — View a visual timeline in the Information tab showing when each member joined and left the group.
- **Stats Dashboard** — Visual charts (pie, bar) showing spending by category and participant. Per-person totals and shares.
- **Balances Overview** — At-a-glance summary of who owes what, with visual progress bars.
- **PWA Support** — Install JointSettle as a Progressive Web App on mobile or desktop.
- **23+ Languages** — Internationalized UI with translations contributed by the open-source community.
- **Blog** — Integrated blog with RSS feed for announcements and updates.
- **Dark Mode** — Full theme support via `next-themes`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database** | PostgreSQL via Prisma ORM |
| **API Layer** | tRPC v11 (end-to-end typesafe APIs) |
| **Forms** | React Hook Form + Zod validation |
| **UI Components** | Radix UI primitives + shadcn/ui |
| **Styling** | Tailwind CSS + class-variance-authority |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Internationalization** | next-intl (23+ locales) |
| **AI Integration** | OpenAI API (GPT-3.5 Turbo / GPT-4o Vision) |
| **CSV Parsing** | PapaParse |
| **Auth** | Custom hash-based (no external provider) |
| **Deployment** | Vercel (serverless) |
| **CI/CD** | GitHub Actions (CI checks + Docker CD to ghcr.io) |
| **Analytics** | Plausible (privacy-focused) |
| **Email** | Resend |
| **S3 Uploads** | next-s3-upload |
| **Monorepo** | npm workspaces |

---

## Project Structure

```
.
├── prisma/                  # Database schema & migrations
│   ├── schema.prisma        # Prisma schema (10 models, 3 enums)
│   ├── seed.ts              # Category seed script
│   └── migrations/          # 24 migration files
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── groups/          # Group CRUD, expenses, balances, stats
│   │   ├── login/           # Hash-based login page
│   │   ├── signup/          # Account creation page
│   │   └── blog/            # Blog with RSS feed
│   ├── components/          # Shared UI components (shadcn/ui)
│   │   └── ui/              # Base UI primitives
│   ├── lib/                 # Business logic
│   │   ├── auth.ts          # Hash generation & verification
│   │   ├── api.ts           # Database API functions
│   │   ├── balances.ts      # Balance calculation engine
│   │   ├── totals.ts        # Spending/shares calculations
│   │   ├── currency.ts      # Currency data & conversion
│   │   └── schemas.ts       # Zod validation schemas
│   ├── trpc/                # tRPC router definitions
│   │   └── routers/         # groups, expenses, balances, auth, categories
│   └── i18n/                # Internationalization config
├── messages/                # Translation JSON files (24 languages)
├── scripts/                 # Utility scripts
├── .github/workflows/       # CI + CD pipelines
├── Dockerfile               # Multi-stage Docker build
└── vercel.json              # Vercel deployment config
```

---

## Installation

### Prerequisites

- **Node.js** v18+ (v20+ recommended)
- **PostgreSQL** 14+ (local or remote)
- **npm** v9+

### 1. Clone the Repository

```bash
git clone https://github.com/itsdikshitaa/JointSettle.git
cd JointSettle
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/jointsettle"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/jointsettle"

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Optional: AI Features
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_ENABLE_RECEIPT_EXTRACT="true"
NEXT_PUBLIC_ENABLE_CATEGORY_EXTRACT="true"

# Optional: S3 File Uploads
NEXT_PUBLIC_ENABLE_EXPENSE_DOCUMENTS="true"
S3_UPLOAD_KEY="..."
S3_UPLOAD_SECRET="..."
S3_UPLOAD_BUCKET="..."
S3_UPLOAD_REGION="us-east-1"
S3_UPLOAD_ENDPOINT="https://..."

# Optional: Analytics
PLAUSIBLE_DOMAIN="yourdomain.com"

# Optional: Email (Feedback)
RESEND_API_KEY="re_..."
FEEDBACK_EMAIL_FROM="feedback@example.com"
FEEDBACK_EMAIL_TO="you@example.com"

# Optional: Stripe Donations
STRIPE_DONATION_LINK="https://..."
```

### 4. Set Up Database

```bash
# Push schema to your database
npx prisma db push

# Seed categories (101 categories across 12 groupings)
npx ts-node --transpile-only prisma/seed.ts

# Generate Prisma client
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Using the App

1. Go to **Sign Up** → receive your 8-character access hash
2. **Save your hash** — it is your only login credential
3. **Create a group** with participants
4. **Add expenses** with any split mode
5. View **Balances** to see suggested reimbursements
6. **Mark as paid** to record settlements

---

## Database Setup

JointSettle uses **PostgreSQL** with **Prisma ORM**. The schema includes 10 models:

- **User** — Unique hash-based identity
- **Group** — Expense group with currency settings
- **Participant** — Person within a group
- **Expense** — Financial transaction with split details
- **ExpensePaidFor** — Join table tracking per-participant shares
- **Category** — Expense classification (101 pre-seeded categories)
- **ExpenseDocument** — Attached receipt images
- **Activity** — Audit log of all changes
- **RecurringExpenseLink** — Chain of recurring expenses
- **RecurrenceRule** — DAILY / WEEKLY / MONTHLY enum

All monetary amounts are stored as **integers in minor units** (e.g., cents).

---

## AI Tools Used During Development

This project was developed with assistance from AI coding agents:

- **Fable5** — Used for initial planning and architecture design phases
- **Opus 4.8** — Primary AI assistant for feature implementation, refactoring, bug fixes, and documentation generation
- **GitHub Copilot** — Inline code completions within the editor
- **OpenAI GPT** — Used within the app itself for receipt scanning and category extraction features

AI tools were used for:
- Generating boilerplate code and tRPC procedures
- Writing validation schemas and type definitions
- Debugging TypeScript and build errors
- Creating comprehensive documentation
- Database schema design assistance

---

## Deployment

### Vercel (Primary)

The app is configured for Vercel deployment. Set up the required environment variables (`DATABASE_URL`, `POSTGRES_URL_NON_POOLING`, `NEXT_PUBLIC_BASE_URL`) and deploy:

```bash
npx vercel --prod
```

---

## License

This project is open source under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Contributing

Contributions are welcome! Please open an issue or pull request on [GitHub](https://github.com/itsdikshitaa/JointSettle).

---

## Built With

[Next.js](https://nextjs.org/), [tRPC](https://trpc.io/), [Prisma](https://www.prisma.io/), and [shadcn/ui](https://ui.shadcn.com/).
