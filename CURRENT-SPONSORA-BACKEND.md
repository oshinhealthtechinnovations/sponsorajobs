# CURRENT SPONSORA JOBS BACKEND AUDIT & ARCHITECTURE SPECIFICATION
**Author:** AI Engineering Head of Sponsora Jobs  
**Status:** COMPLETE AUDIT (Phase 1 & Phase 2)  
**Date:** August 26, 2026  
**Repository:** `sponsorajobs/sponsorajobs`

---

## 1. Project Structure Map

```text
sponsorajobs/
├── app/                                 # Next.js 14 App Router (React Server Components + Edge Runtime)
│   ├── layout.tsx                       # Global layout & metadata
│   ├── page.tsx                         # Homepage (Search Hero, Value Prop, Stats, Filters)
│   ├── jobs/                            # Job Search Hub (/jobs, /jobs/[country], /jobs/[country]/[category])
│   ├── job/[slug]/                      # Job Detail Page (Rich description, Schema.org, Direct Apply)
│   ├── companies/                       # Verified Sponsor Companies Index (/companies, /company/[slug])
│   ├── countries/                       # Global Jurisdictions Directory (/countries)
│   ├── categories/                      # Sector Hubs (/categories, /categories/[slug])
│   ├── visa-sponsorship/                # Programmatic Immigration & Visa Guides (/visa-sponsorship/[country])
│   ├── admin/                           # Admin Console (RSC & Client-Side)
│   │   ├── page.tsx                     # System Operations Dashboard (Telemetry, KPIs, Country breakdowns)
│   │   ├── login/page.tsx               # Master Secret Login Portal
│   │   ├── jobs/page.tsx                # Job Management & Review Queue
│   │   ├── sources/page.tsx             # Source Adapter Management & Manual Ingestion Trigger
│   │   ├── alerts/page.tsx              # Job Alert Subscribers Portal (CSV Export, Copy Emails)
│   │   ├── runs/page.tsx                # Ingestion Run History & Logs
│   │   └── settings/page.tsx            # Ingestion & Classifier Threshold Configuration
│   ├── api/                             # REST API Endpoints (Edge Runtime)
│   │   ├── admin/auth/                  # Admin session verification & cookie issue
│   │   ├── admin/jobs/                  # Admin CRUD operations on jobs & batch review
│   │   ├── admin/sources/               # Ingestion triggers & adapter toggling
│   │   ├── admin/alerts/                # Admin subscriber listing & CSV export
│   │   ├── alerts/subscribe/            # Public job alert subscriber signup & welcome email
│   │   ├── categories/                  # Public categories list
│   │   ├── companies/                   # Public companies directory
│   │   ├── countries/                   # Public countries directory
│   │   ├── cron/ingest/                 # Scheduled/Vercel cron ingestion runner with rate protection
│   │   ├── health/                      # System health check endpoint
│   │   ├── jobs/                        # Filtered search & pagination API
│   │   └── search/                      # Multi-attribute relevance search API
│   ├── sitemap.ts                       # Dynamic Programmatic XML Sitemap (5,000+ routes)
│   └── robots.ts                        # Crawler governance & budget protection
├── components/                          # React UI Component Library
├── config/                              # Static configuration (categories, countries, sources)
├── lib/
│   ├── db/                              # Multi-provider database abstraction
│   │   ├── client.ts                    # Edge-safe in-memory, SQL.js, and Cloudflare D1 adapter
│   │   ├── schema.sql                   # Relational SQLite/PostgreSQL schema
│   │   └── staticData.ts / realJobsData.json # Seeded database dataset
│   ├── repositories/                    # Data Access Layer
│   │   ├── jobRepository.ts             # Weighted search, filtering, deduplication, relevance scoring
│   │   ├── companyRepository.ts         # Company indexing & metadata
│   │   ├── categoryRepository.ts        # Category metadata
│   │   ├── countryRepository.ts         # Country metadata
│   │   └── alertRepository.ts           # Alert subscription queries
│   ├── services/                        # Business Logic Services
│   │   ├── adminAuth.ts                 # Admin secret cookie verification
│   │   ├── cloudStorageService.ts       # Supabase REST & Upstash Redis zero-dependency cloud sync
│   │   ├── descriptionFormatter.ts      # HTML description sanitization & markdown conversion
│   │   ├── emailService.ts              # Job alerts welcome email & HTML template generation
│   │   ├── ingestionService.ts          # Ingestion orchestrator, deduplication, auto-washout
│   │   ├── urlResolver.ts               # Direct ATS URL resolution
│   │   └── urlValidator.ts              # Apply URL validation & ATS safety checks
│   ├── seo/                             # Programmatic SEO & Structured Data
│   │   ├── metadata.ts                  # Canonical URL & OpenGraph builder
│   │   └── schema.ts                    # Schema.org JobPosting & BreadcrumbList JSON-LD
│   └── utils/
│       ├── searchNormalizer.ts          # Role synonyms & typo correction dictionary
│       └── sanitize.ts                  # XSS protection
├── sources/                             # Source Ingestion Adapters
│   ├── base/JobSourceAdapter.ts         # Abstract source adapter interface
│   ├── registry.ts                      # Ingestion source orchestrator & error isolation
│   ├── arbeitnow/                       # Free API adapter (visa_sponsorship: true)
│   ├── remotive/                        # Free remote tech adapter
│   ├── adzuna/                          # Adzuna API adapter
│   ├── usajobs/                         # USAJobs Federal API adapter
│   ├── jooble/                          # Jooble API adapter
│   ├── greenhouse/                      # Direct Greenhouse ATS scraper/fetcher
│   ├── lever/                           # Direct Lever ATS scraper/fetcher
│   ├── ashby/                           # Direct Ashby ATS scraper/fetcher
│   └── workable/                        # Direct Workable ATS scraper/fetcher
├── scoring/                             # Deterministic Sponsorship & Quality Scoring
│   ├── classifier.ts                    # Rule-based visa classification (Strong, Likely, Unlikely)
│   └── qualityScorer.ts                 # Title, description, and salary completeness scoring
├── migrations/                          # Database migration scripts
│   └── supabase_schema.sql              # Supabase Postgres schema & RLS policies
└── tests/                               # 13 Vitest suites (129 unit & integration tests)
```

---

## 2. Backend Architecture & Request Flows

### User Request Flow (Search & Job Detail)
```text
USER / GOOGLE BOT
       ↓
  Next.js Edge / Node Runtime
       ↓
  Route Handler / Server Component (e.g. app/jobs/page.tsx or app/job/[slug]/page.tsx)
       ↓
  JobRepository (Data Access Layer)
       ↓
  Database Client (lib/db/client.ts)
       ├─► Live SQLite / Cloudflare D1 / Memory store
       └─► Supabase REST Cloud (for alert subscribers)
       ↓
  Sanitization & Structured Data Serialization (lib/seo/schema.ts)
       ↓
  Hydrated HTML + JSON-LD Response (under 50ms TTFB)
```

### Background Ingestion Flow
```text
Vercel Cron / Admin Manual Trigger (/api/cron/ingest or /admin/sources)
       ↓
  IngestionService (lib/services/ingestionService.ts)
       ↓
  SourceRegistry.executeSource(sourceId)
       ↓
  Source Adapter (Arbeitnow, Remotive, Adzuna, USAJobs, Jooble, Greenhouse, Lever, Ashby)
       ↓
  Description Sanitizer & Quality Scorer
       ↓
  SponsorshipClassifier.classify(rawJob) -> (Strong, Likely, Unlikely, None)
       ↓
  Deduplication: Title + Company + Location Hash & Direct URL normalization
       ↓
  Upsert into Database (jobs table)
       ↓
  Audit Trail Logged in source_runs table
       ↓
  Storage Washout & Expiration of stale postings (> 30 days)
```

---

## 3. Database Schema Audit

| Table | Primary Key | Purpose | Status in Production |
| :--- | :--- | :--- | :--- |
| `jobs` | `id (TEXT)` | Core job listings, sponsorship labels, salary, remote type, status | Seeded with 648 verified real sponsor jobs |
| `companies` | `id (TEXT)` | Employer metadata, verified sponsor status, careers URL | Seeded with 253 real sponsor employers |
| `countries` | `code (TEXT)` | 5 jurisdictions: UK, US, AU, CA, NZ with visa guides | Seeded & configured |
| `categories` | `id (TEXT)` | 9 occupational sectors (Tech, Healthcare, Engineering, Finance, etc.) | Seeded & configured |
| `sources` | `id (TEXT)` | Source adapter configuration, API limits, enabled flags | Seeded with 9 adapters |
| `source_runs` | `id (TEXT)` | Telemetry, run duration, jobs fetched/inserted/updated, error logs | Tracked on every run |
| `job_alerts` | `id (TEXT)` | Subscriber emails, target keywords, country preference, frequency | **Stored live in Supabase Postgres** |

---

## 4. Source Adapters Audit

| Adapter | Type | API Key Required? | Status |
| :--- | :--- | :--- | :--- |
| **Arbeitnow** | Free JSON REST API | No | **REAL & ACTIVE** (Explicit visa sponsorship flag) |
| **Remotive** | Free JSON REST API | No | **REAL & ACTIVE** (Global tech jobs) |
| **Adzuna** | Partner REST API | Yes (`ADZUNA_APP_ID/KEY`) | **REAL & CONFIGURED** |
| **USAJobs** | Federal Govt REST API | Yes (`USAJOBS_API_KEY`) | **REAL & CONFIGURED** |
| **Jooble** | Jobs Search REST API | Yes (`JOOBLE_API_KEY`) | **REAL & CONFIGURED** |
| **Greenhouse** | ATS Feed Fetcher | No | **REAL & ACTIVE** (Direct employer URLs) |
| **Lever** | ATS Feed Fetcher | No | **REAL & ACTIVE** (Direct employer URLs) |
| **Ashby** | ATS Feed Fetcher | No | **REAL & ACTIVE** (Direct employer URLs) |
| **Workable** | ATS Feed Fetcher | No | **REAL & ACTIVE** |

---

## 5. Admin Console Audit

| Admin Page | UI Exists? | Backend Connected? | Database Connected? | Real-Time Data? | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Dashboard (`/admin`)** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Live KPI counts & telemetry |
| **Job Management (`/admin/jobs`)** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Search, filter, status toggling |
| **Source Adapters (`/admin/sources`)** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Status badges & 1-click test runs |
| **Alert Subscribers (`/admin/alerts`)** | ✅ Yes | ✅ Yes | ✅ Yes (Supabase) | ✅ Yes | Live Supabase subscriber table, CSV export, copy emails |
| **Ingestion Runs (`/admin/runs`)** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Ingestion history & error tracking |
| **Settings (`/admin/settings`)** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Thresholds & active toggles |

---

## 6. SEO & Google Indexation Audit

### Strengths:
1. **Dynamic Programmatic Sitemap (`/sitemap.xml`)**: Generates 5,000+ URLs dynamically including:
   - Core landing pages (`/jobs`, `/countries`, `/categories`, `/companies`).
   - Country hubs (`/jobs/uk`, `/jobs/us`, `/jobs/au`, `/jobs/ca`, `/jobs/nz`).
   - Country + Category programmatic matrix hubs (`/jobs/uk/technology`, etc.).
   - Canonical individual job postings (`/job/[slug]`).
2. **Schema.org Structured Data**: Complete `JobPosting` schema with valid `datePosted`, `validThrough`, `hiringOrganization`, `jobLocation`, `baseSalary`, and `directApply: true`.
3. **Robots.txt Protection**: Prevents crawl waste by disallowing `/admin/`, `/api/`, `/_next/`, and ephemeral filter queries `/*?*`.

### Current Limitations to Address in Next Phases:
1. Google Search Console & Indexing API automatic pinging is not yet automated.
2. Canonical URLs for job detail pages currently use `/job/[id]` rather than keyword-rich SEO slugs like `/job/[company]-[title]-[city]-[id]`.
3. Job expiration status (HTTP 410 Gone vs redirecting expired jobs to relevant category hubs) needs explicit SEO handling.
