# SPONSORA SEARCH ENGINE & STRUCTURED DATA POLICY

**Document Version:** 1.0  
**Effective Date:** August 28, 2026  
**Compliance Standard:** Google Search Central, JobPosting Guidelines & Site-Reputation Policies  

---

## 🎯 OBJECTIVE & MANDATE

SponsorAJobs is engineered as an authoritative, high-value visa-sponsorship job discovery engine. We adhere strictly to Google's Search Essentials, JobPosting Guidelines, and Site-Reputation Policies.

---

## 📋 GOOGLE JOBPOSTING COMPLIANCE PROTOCOLS

### 1. Zero Scaled Low-Value Content
SponsorAJobs does not replicate third-party job boards. Every published listing must provide unique, curated value:
- Deterministic visa sponsorship audits (CoS, H-1B, LMIA, TSS 482).
- Clean salary normalization and standardized currency bands.
- Validated geographic and occupational SOC taxonomy mapping.
- Live-verified direct employer application endpoints.

### 2. Immediate Removal of Expired JobPosting Markup
When a job requisition closes (HTTP 404, 410, soft-404 "position closed", or expiration date reached):
1. `is_published` is set to `0` and `status` is set to `expired`.
2. The active `JobPosting` JSON-LD schema is immediately removed from the page.
3. The page title updates to reflect that the opening is closed or expired.
4. Active XML sitemaps immediately omit the expired URL.

### 3. Canonical URL Discipline
- Every job maintains one canonical URL path: `/job/[id]`.
- Faceted navigation query variants (`?country=`, `?sort=`, `?source=`) strictly canonicalize to the primary landing page or include `noindex` headers.

### 4. Thin-Content Safeguard
Category or country hubs with fewer than 5 active vacancies are marked with `noindex, follow` robots directives to protect search engine crawl budgets.

### 5. Truthful Schema Properties
- Never fabricate or guess `validThrough`, `datePosted`, `baseSalary`, or `hiringOrganization`.
- If salary or expiration dates are unconfirmed in the raw source, omit the corresponding fields from JSON-LD structured data.
