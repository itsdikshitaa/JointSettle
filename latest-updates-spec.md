# Latest Updates Section — Specification

## 1. Overview

Add a **"Latest Updates"** page to the JointSettle web app that displays a timeline of feature releases, improvements, and fixes. Accessible via a new nav bar item, publicly viewable without authentication.

## 2. Navigation

| Field | Value |
|---|---|
| Nav label | `"Latest Updates"` |
| Route | `/updates` |
| Position in nav | TBD — suggest placing after "Create a group" / before "Blog" |
| Visibility | Always visible, no login required |

### Nav component to modify

- **File:** `src/components/nav.tsx`
- Add a `<Link>` item with label "Latest Updates" pointing to `/updates`

## 3. Page Layout

- **Type:** Single continuous timeline (reverse chronological)
- **Design:** Minimal text list
- **URL:** `/updates` (new route at `src/app/updates/page.tsx`)
- **Access:** Public — no authentication required
- **Responsiveness:** Works on desktop and mobile

### Page structure (top to bottom)

1. **Page title:** "Latest Updates" — large heading
2. **Subtitle:** Brief description (e.g., "What's new in JointSettle")
3. **Timeline list:** Chronological entries from newest to oldest
4. **Each entry shows:**
   - Date (e.g., "June 15, 2026")
   - Category badge: `New` / `Improved` / `Fixed`
   - Title (e.g., "Hash-Based Authentication")
   - Description (1-3 sentence summary)

## 4. Data Source

- **Type:** Static JSON file
- **Path:** `src/app/updates/updates.json`
- **Why static:** Easy to edit, no database dependency, updates ship with deploys
- **Schema:**

```json
[
  {
    "date": "2026-06-15",
    "category": "new",
    "title": "Hash-Based Authentication",
    "description": "JointSettle now uses a simple hash-based identity system. Generate a unique 8-character hash to create and manage groups — no email or password needed."
  },
  {
    "date": "2026-06-10",
    "category": "improved",
    "title": "Expanded Categories (100+)",
    "description": "Replaced the old category system with 100+ categories across 12 groupings including Housing, Transportation, Food & Dining, Shopping, Entertainment, Travel, Healthcare, Education, and more."
  },
  {
    "date": "2026-06-08",
    "category": "fixed",
    "title": "Group Sharing Fix",
    "description": "Fixed an issue where invited users got 'Group not found'. Any authenticated user can now view and contribute to a shared group."
  }
]
```

### Category enum

| Value | Badge color | Meaning |
|---|---|---|
| `"new"` | Green / emerald | Brand new feature |
| `"improved"` | Blue | Enhancement to existing feature |
| `"fixed"` | Orange / amber | Bug fix |
| `"coming"` | Gray / muted | Upcoming / roadmap item (future use) |

## 5. Content — Initial Updates (full history)

These are the updates to include in the initial release of the page, covering the app's history:

| Date | Category | Title | Description |
|---|---|---|---|
| 2026-06-15 | new | Hash-Based Authentication | JointSettle now uses a simple hash-based identity system. Generate a unique 8-character hash to create and manage groups — no email or password needed. |
| 2026-06-15 | improved | Expanded Categories (100+) | Replaced the old category system with 100+ categories across 12 groupings including Housing, Transportation, Food & Dining, Shopping, Entertainment, Travel, Healthcare, Education, and more. |
| 2026-06-14 | fixed | Vercel Deployment Fix | Fixed Prisma database connection issues and streamlined the Vercel build process. Database schema is now synced automatically on deploy. |
| 2026-06-14 | fixed | Group Sharing Fix | Fixed an issue where invited users got 'Group not found'. Any authenticated user with a valid hash can now view and contribute to a shared group. |
| 2026-06-13 | fixed | Prisma Client Fix | Resolved a critical runtime error where the Prisma database client was undefined, causing all database operations to fail. |
| 2026-06-10 | new | Stats & Charts Dashboard | Added interactive pie charts and bar charts showing group spending breakdowns, powered by Recharts. |
| 2026-06-05 | new | Recurring Expenses | Support for daily, weekly, and monthly recurring expenses with automatic date scheduling. |
| 2026-06-01 | new | Activity Log | Full audit trail showing all group activity including expense creation, updates, and deletions. |
| 2026-05-25 | improved | Multi-Currency Support | Added live exchange rate conversion for 170+ currencies. Expenses can be recorded in one currency and converted to the group currency. |
| 2026-05-20 | new | AI Receipt Scanning | Upload receipt images and auto-fill expense details using AI-powered OCR. (Beta) |
| 2026-05-15 | new | PWA Support | JointSettle can now be installed as a Progressive Web App on any device. |
| 2026-05-10 | new | i18n — 23 Languages | Added internationalization support for 23+ languages including French, Spanish, German, Japanese, and more. |
| 2026-05-01 | new | JSON & CSV Export | Export all group expenses as JSON or CSV files for external analysis. |
| 2026-04-20 | new | Smart Split Modes | Split expenses evenly, by shares, by percentage, or by custom amounts. |
| 2026-04-10 | new | Optimized Reimbursements | Get settlement suggestions that minimize the number of money transfers between participants. |
| 2026-04-01 | new | Initial Launch | JointSettle launched as a minimalist expense-sharing app with groups, expenses, and basic balance calculations. |

## 6. Files to Create

| File | Purpose |
|---|---|
| `src/app/updates/page.tsx` | Page component rendering the timeline |
| `src/app/updates/updates.json` | Static JSON data file with all updates |

## 7. Files to Modify

| File | Change |
|---|---|
| `src/components/nav.tsx` | Add "Latest Updates" link pointing to `/updates` |
| `src/i18n/messages/en-US.json` | Add translation strings for the page title, subtitle, and category labels |
| Other locale files | Add the same translation strings (optional for now) |

## 8. Page Component Specification

The `page.tsx` component should:

1. Import the JSON data
2. Sort entries by date (newest first)
3. Render a timeline with:
   - A header section with title and subtitle
   - A vertical timeline line (optional visual design)
   - Each entry as a row/card showing: date, category badge, title, description
4. Be a Server Component (no client-side interactivity needed)
5. Use translation strings from `next-intl` for headings and labels
6. Format dates using `dayjs` (already a project dependency)

### Example structure

```tsx
// src/app/updates/page.tsx (server component)
import { TrackPage } from '@/components/track-page'
import { useTranslations } from 'next-intl'
import updates from './updates.json'

export default function UpdatesPage() {
  const t = useTranslations('Updates')
  return (
    <main>
      <TrackPage path="/updates" />
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <div className="timeline">
        {updates.sort(byDateDesc).map((update) => (
          <div key={update.date + update.title}>
            <span>{update.date}</span>
            <Badge category={update.category} />
            <h3>{update.title}</h3>
            <p>{update.description}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
```

## 9. Translation Keys (en-US.json)

```json
"Updates": {
  "title": "Latest Updates",
  "subtitle": "What's new in JointSettle — features, improvements, and fixes.",
  "category": {
    "new": "New",
    "improved": "Improved",
    "fixed": "Fixed",
    "coming": "Coming Soon"
  }
}
```

## 10. Acceptance Criteria

- [ ] `/updates` page loads and displays the timeline correctly
- [ ] Nav bar shows "Latest Updates" link
- [ ] Link navigates to `/updates`
- [ ] Updates are sorted newest-first
- [ ] Each update shows date, category badge, title, and description
- [ ] Page is accessible without logging in
- [ ] Page is responsive (mobile + desktop)
- [ ] TypeScript typecheck passes
- [ ] i18n works for page headings and category labels

## 11. Future Considerations (out of scope for initial implementation)

- Auto-fetch from GitHub Releases API
- Admin interface to add updates without code changes
- Featured/banner updates for major releases
- Pagination if the list grows very long
- RSS/Atom feed for updates
