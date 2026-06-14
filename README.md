<div align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
  <img src="https://img.shields.io/github/stars/itsdikshitaa/JointSettle?style=social" alt="Stars" />
</div>

<br />

<div align="center">
  <h1>🤝 JointSettle</h1>
  <p><strong>Split expenses, not friendships.</strong></p>
  <p>Minimalist, privacy-first expense sharing for friends and family — no ads, no account required.</p>
</div>

<div align="center">
  <a href="https://jointsettle.app" target="_blank">🌐 Live App</a>
  ·
  <a href="https://github.com/itsdikshitaa/JointSettle/issues" target="_blank">🐛 Report Bug</a>
  ·
  <a href="https://github.com/itsdikshitaa/JointSettle/discussions" target="_blank">💬 Discussions</a>
</div>

<br />

---

## 📖 About

**JointSettle** is a modern, open-source web application for effortlessly splitting expenses with friends, family, roommates, or travel companions. No sign-up required — just create a group, add expenses, and let JointSettle figure out who owes what.

Unlike traditional expense-splitting apps, JointSettle is:
- **Fully anonymous** — no accounts, no passwords, no personal data stored
- **Ad-free** — no distractions, no tracking
- **Open source** — transparent, auditable, community-driven
- **Self-hostable** — deploy your own instance with Docker

Built for groups of any size, JointSettle handles everything from simple dinner splits to complex multi-currency trip expenses with different split modes.

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Groups** | Create shared spaces for trips, roommates, events, or any shared expenses |
| 💰 **Expenses** | Add, edit, and categorize expenses with ease |
| 🔀 **Smart Splits** | Split evenly, by shares, by percentage, or by custom amounts |
| 🔁 **Recurring Expenses** | Set daily, weekly, or monthly recurring expenses |
| 📊 **Balances & Stats** | Visual dashboards showing who owes what with beautiful charts |
| 💳 **Reimbursements** | Get optimized settlement suggestions to minimize transfers |
| 📸 **Receipt Scanning** | AI-powered receipt scanning to auto-fill expense details |
| 🏷️ **Categories** | Organize expenses with a rich set of categories |
| 💱 **Multi-Currency** | Support for 170+ currencies with live exchange rates |
| 📄 **Export** | Export expenses as JSON or CSV |
| 📱 **PWA Ready** | Install as a progressive web app on any device |
| 🔒 **No Account Required** | Full functionality without sign-up — your data, your control |

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/) |
| **tRPC** | End-to-end type-safe API calls |
| **i18n** | [next-intl](https://next-intl-docs.vercel.app/) — 22+ languages |
| **Auth** | None needed — fully anonymous |
| **Hosting** | [Vercel](https://vercel.com/) |
| **Analytics** | [Plausible](https://plausible.io/) (privacy-friendly) |
| **Payments** | [Stripe](https://stripe.com/) (for donations/support) |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ 
- **pnpm** (recommended) or npm
- **PostgreSQL** (local or remote)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/itsdikshitaa/JointSettle.git
cd JointSettle

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp container.env.example .env.local
# Edit .env.local with your database URL and other config

# 4. Start the database (if using Docker)
docker compose up -d

# 5. Run database migrations
pnpm prisma migrate dev

# 6. Start the dev server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_BASE_URL` | Public base URL (e.g., `http://localhost:3000`) | ✅ |
| `OPENAI_API_KEY` | For AI receipt scanning | Optional |
| `STRIPE_DONATION_LINK` | Stripe donation/support link | Optional |
| `PLAUSIBLE_DOMAIN` | Plausible analytics domain | Optional |
| `RESEND_API_KEY` | For email feedback forms | Optional |
| `S3_UPLOAD_*` | S3 credentials for receipt image uploads | Optional |

## 🏗️ Architecture

```
src/
├── app/                 # Next.js App Router pages
│   ├── groups/          # Group management, expenses, balances, stats
│   ├── blog/            # Blog pages
│   └── api/             # API routes (health, S3 upload, tRPC)
├── components/          # Reusable UI components
│   └── ui/              # shadcn/ui primitives
├── lib/                 # Business logic, utilities, helpers
│   ├── balances.ts      # Balance calculation engine
│   ├── totals.ts        # Spending totals computation
│   ├── currency.ts      # Currency data & formatting
│   └── schemas.ts       # Zod validation schemas
├── trpc/                # tRPC router definitions
│   └── routers/         # groups, expenses, categories, activities, stats, balances
├── i18n/                # Internationalization config
└── messages/            # Translation files (23 locales)
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place. Any contributions you make are **greatly appreciated**.

1. **Fork** the project
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

See the [open issues](https://github.com/itsdikshitaa/JointSettle/issues) for feature requests and bug reports.

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features when applicable
- Ensure all type checks pass (`pnpm typecheck`)
- Ensure all tests pass (`pnpm test`)

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

## 💖 Support

If you find JointSettle useful, consider:

- ⭐ Starring the project on GitHub
- 🐦 Sharing it on social media
- ☕ [Supporting our hosting costs](https://github.com/sponsors/itsdikshitaa)

---

<div align="center">
  Built with ❤️ by <a href="https://dikshitaa.tech/" target="_blank">Dikshita</a> and amazing <a href="https://github.com/itsdikshitaa/JointSettle/graphs/contributors" target="_blank">contributors</a>.
  <br />
  <sub>No ads. No account. Open Source. Forever Free.</sub>
</div>
