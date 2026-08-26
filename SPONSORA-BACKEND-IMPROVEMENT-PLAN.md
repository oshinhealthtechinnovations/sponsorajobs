# SPONSORA JOBS — BACKEND & SEO IMPROVEMENT PLAN
**Author:** AI Engineering Head of Sponsora Jobs  
**Status:** PROPOSED ROADMAP  
**Date:** August 26, 2026  

---

## 1. Improvement Prioritization (P0, P1, P2)

### 🔴 P0 — Critical (Immediate Reliability & Security)
1. **Automated Error Boundary & Rate Limiting**:
   - Add Token Bucket rate limiter on public API routes (`/api/search`, `/api/jobs`, `/api/alerts/subscribe`) to protect against scraper bots and abuse.
2. **Expired Job SEO Lifecycle (410 vs 301)**:
   - When a job expires, render an intelligent fallback ("*This job has closed, but here are 4 similar verified visa sponsorship jobs in [City]*") with an HTTP 410 or meta noindex to prevent Google soft-404 penalties.
3. **Database Dual-Write & Auto-Sync**:
   - Seamlessly synchronize newly ingested jobs between the local cache and Supabase cloud Postgres for permanent multi-region persistence.

---

### 🟡 P1 — Growth & SEO Critical (Organic Google Dominance)
1. **SEO Slugs Overhaul for High CTR**:
   - Upgrade job URLs from `/job/[id]` to descriptive, keyword-rich SEO slugs:
     - Example: `/job/monzo-senior-backend-engineer-london-sponsorship-cos`
   - Preserve backward compatibility with permanent 301 redirects from old ID URLs.
2. **Programmatic Job Breadcrumbs & Internal Linking Web**:
   - Add rich cross-linking modules at the bottom of every job detail page:
     - *"More Visa Sponsorship Jobs at [Company]"*
     - *"More [Category] Jobs in [City/Country]"*
     - *"Similar [Role] Jobs Offering Visa Sponsorship"*
3. **Google Indexing API Integration**:
   - Automatically notify Google Indexing API upon publishing new verified jobs or expiring closed ones for instant indexing within minutes.
4. **Automated Weekly Email Digest Dispatcher**:
   - A serverless cron job that queries Supabase for active subscribers, pulls matching newly published sponsor jobs, and triggers an automated email digest.

---

### 🟢 P2 — Optimization & Polish (Scalability)
1. **Automated ATS Health Checker**:
   - Background daemon that performs `HEAD` requests to verify whether direct employer application links are still active before displaying them.
2. **Enhanced Search Telemetry & Keyword Analytics**:
   - Track zero-result searches in the admin dashboard so the team knows exactly which visa categories to source next.
3. **Automated Company Sponsorship Scorecard**:
   - Display employer historical visa sponsorship stats (e.g. UK Home Office Tier 2 / Skilled Worker register status).
