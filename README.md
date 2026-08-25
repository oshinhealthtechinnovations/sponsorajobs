# SponsorAJobs.com — Production Platform

A zero-infrastructure-cost, deterministic visa-sponsorship job discovery platform targeting the **UK, US, Australia, Canada, and New Zealand**.

Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Cloudflare D1 / Cloudflare Pages.

---

## 🚀 Key Features

1. **Target Countries & Visas**:
   - 🇬🇧 **United Kingdom**: Skilled Worker Visa, Certificate of Sponsorship (CoS), Home Office Sponsor Licence.
   - 🇺🇸 **United States**: H-1B, H-1B Transfer, Green Card, O-1, E-3, TN.
   - 🇦🇺 **Australia**: TSS Subclass 482, Subclass 186 ENS, Skills in Demand Visa.
   - 🇨🇦 **Canada**: LMIA Supported, Provincial Nominee Program (PNP), TFWP.
   - 🇳🇿 **New Zealand**: Accredited Employer Work Visa (AEWV), Green List Tier 1.

2. **Deterministic Sponsorship Intelligence Engine**:
   - Multi-stage pattern lexicon across all 5 countries.
   - Negation masking prevents sub-phrase false positives (e.g. *"no visa sponsorship is available"*).
   - Conflict resolution: when conflicting evidence co-occurs across paragraphs, flags `REVIEW_REQUIRED`.
   - Admin classification override with immutable audit logging in `admin_action_log`.

3. **Source-Agnostic Modular Connectors**:
   - **USAJobs Adapter**: Official US federal search API connector (`data.usajobs.gov`).
   - **Ashby ATS Adapter**: Public career board connector (`api.ashbyhq.com`).
   - **Workable ATS Adapter**: Public widget feed connector (`apply.workable.com`).
   - **Adzuna Adapter**: Multi-country aggregator with mandatory attribution (`attribution_required = 1`).
   - **Fault Isolation**: One failed or offline source never crashes other adapters.

4. **Automated Ingestion, Deduplication & Expiration**:
   - **Quality Filter**: Rejects incomplete, spam, or broken listings.
   - **Deduplication**: Computes `canonical_hash` over normalized `(company + title + location + applyUrl)` to eliminate duplicates.
   - **Failure-Safe Expiration**: Unseen jobs expire after 30 days, but active listings are **strictly protected** if an external API experiences a timeout.

5. **Programmatic SEO & Rich Snippets**:
   - Google `JobPosting` JSON-LD with quantitative salaries and `TELECOMMUTE` remote flags.
   - Dynamic `sitemap.xml` generating landing pages, country hubs, category hubs, and 45 country+category combination matrix hubs.
   - Optimized `robots.txt` and thin-content safeguards (`noindex` on pages with `< 5` vacancies).

6. **Security & Performance**:
   - Strict HTTP security headers (CSP, HSTS, X-Frame-Options: `DENY`, X-Content-Type-Options: `nosniff`, Permissions-Policy).
   - In-memory sliding window API rate limiting (HTTP `429 Too Many Requests`).
   - HTML sanitization and parameterized SQL injection defense.
   - Global and route-level React Error Boundaries.

---

## 🛠️ Zero-Cost Cloudflare Deployment Runbook

SponsorAJobs is designed to operate on **Cloudflare Free Tier** ($0/month):
- **Cloudflare Pages / Workers**: Unlimited static assets + 100,000 requests/day free.
- **Cloudflare D1 SQLite**: 5 GB storage, 5M reads/day, 100k writes/day free.

### Step 1: Install Wrangler & Authenticate
```bash
npm install -g wrangler
wrangler login
```

### Step 2: Create Cloudflare D1 Database
```bash
wrangler d1 create sponsorajobs-db
```
*Copy the resulting `database_id` into your `wrangler.jsonc` file.*

### Step 3: Run Database Migrations
```bash
# 1. Create tables
wrangler d1 execute sponsorajobs-db --file=./migrations/001_initial_schema.sql

# 2. Create performance indexes
wrangler d1 execute sponsorajobs-db --file=./migrations/002_indexes.sql
```

### Step 4: Configure Production Secrets
```bash
wrangler pages secret put ADMIN_SECRET
wrangler pages secret put CRON_SECRET
# Optional API Keys:
wrangler pages secret put USAJOBS_API_KEY
wrangler pages secret put USAJOBS_EMAIL
wrangler pages secret put ADZUNA_APP_ID
wrangler pages secret put ADZUNA_APP_KEY
```

### Step 5: Deploy to Cloudflare Pages
```bash
# Build and deploy
npm run build
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name=sponsorajobs
```

---

## 💻 Local Development Guide

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation
```bash
git clone https://github.com/your-org/sponsorajobs.git
cd sponsorajobs
npm install
```

### Database Seeding
To populate local in-memory SQLite database with sample countries, categories, sources, companies, and jobs:
```bash
npm run db:seed
```

### Running Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Running Test Matrix
```bash
# Run all Vitest unit, classifier, integration, and security tests
npm run test

# Run TypeScript strict typecheck
npm run typecheck

# Verify production Next.js build
npm run build
```

---

## 📂 Project Architecture

```
├── app/
│   ├── (public)/                 # Public search & discovery pages
│   │   ├── page.tsx              # Homepage with hero & curated listings
│   │   ├── jobs/                 # Search engine with multi-attribute filtering
│   │   ├── job/[slug]/           # Job details with sponsorship analysis & JSON-LD
│   │   ├── jobs/[country]/       # Country hub landing pages
│   │   ├── jobs/[country]/[cat]/ # Programmatic country+category matrix pages
│   │   ├── visa-sponsorship/     # Country visa guide landing pages
│   │   ├── companies/            # Verified sponsor companies directory
│   │   └── ...                   # Static trust pages (about, terms, privacy)
│   ├── admin/                    # Secure Admin Console
│   │   ├── page.tsx              # Operations telemetry dashboard
│   │   ├── jobs/                 # Moderation & classification override
│   │   ├── sources/              # Source adapters & health management
│   │   ├── runs/                 # Ingestion run history & logs
│   │   └── settings/             # System configuration & feature flags
│   ├── api/                      # Edge API Endpoints
│   │   ├── jobs/                 # Search API with rate limiting & caching
│   │   ├── search/               # Fast query endpoint
│   │   ├── cron/ingest/          # Scheduled ingestion trigger
│   │   ├── health/               # Diagnostic health check
│   │   └── admin/                # Admin auth, moderation, and triggers
│   ├── error.tsx                 # Client error boundary
│   ├── global-error.tsx          # Root error boundary
│   ├── robots.ts                 # Crawler robots.txt directives
│   └── sitemap.ts                # Dynamic XML sitemap generator
├── config/                       # Rules, categories, and country metadata
├── lib/
│   ├── db/                       # Cloudflare D1 & SQL.js dual database client
│   ├── repositories/             # Parameterized SQL query repositories
│   ├── security/                 # Rate limiting, XSS sanitization, CSP
│   ├── seo/                      # Schema & metadata generators
│   └── services/                 # Ingestion orchestration & Admin auth
├── migrations/                   # D1 versioned SQL schema & indexes
├── scoring/                      # Sponsorship classification engine
├── sources/                      # USAJobs, Ashby, Workable, Adzuna adapters
└── tests/                        # Comprehensive Vitest test suite (118+ tests)
```

---

## 🔒 License & Attribution

- Built exclusively with permissioned API feeds and public career endpoints.
- Adzuna attribution strictly rendered when enabled.
- MIT License.
