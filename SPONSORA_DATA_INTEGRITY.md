# SPONSORA DATA INTEGRITY DOCTRINE & OPERATING RULES

**Document Version:** 1.0  
**Effective Date:** August 28, 2026  
**System Standard:** Sponsora Job Acquisition & Publishing Platform  

---

## 🏛️ CORE AXIOM

$$\text{DISCOVERED JOB} \neq \text{VERIFIED JOB} \neq \text{PUBLISHED JOB}$$

A job posting must **NEVER** become public on SponsorAJobs merely because an automated crawler, scraper, or feed ingestion tool discovered it.

---

## 📜 NON-NEGOTIABLE OPERATING RULES

### Rule 1: Zero Automatic Trust
No source is automatically trusted. All sources must be explicitly vetted, registered, and approved before ingestion begins.

### Rule 2: No Direct-to-Public Publishing
Scrapers, adapters, and feed readers must never insert records directly into the public `jobs` layer.

### Rule 3: Mandatory Quarantine
Every newly discovered job must initially enter the `quarantined` state with `is_published = 0`.

### Rule 4: HTTP 200 $\neq$ Live Job
A successful HTTP 200 response code does not prove that a job requisition is open or actionable. The content must be analyzed for closed/expired signals (Soft-404 detection).

### Rule 5: 404 / 410 Means Expired
An HTTP 404 (Not Found) or 410 (Gone) response confirms the requisition is dead and immediately triggers transition to `expired` status and removal from public listings.

### Rule 6: 403 / 429 Means Unverifiable, Not Dead
An HTTP 403 (Forbidden) or 429 (Too Many Requests) indicates access restriction or rate limiting. It must be treated as `UNVERIFIABLE` or queued for backoff retry—never assumed dead.

### Rule 7: Homepage Redirects Are Invalid
If a job URL or application link redirects to a company homepage, the link is dead and must be rejected immediately.

### Rule 8: Careers Hubs Are Not Application URLs
A generic careers search page (e.g., `company.com/careers`) is not a valid requisition link and cannot be published as a direct apply path.

### Rule 9: Never Invent URLs
SponsorAJobs systems must never construct, fabricate, or guess URLs. Every URL must originate from a verified source payload.

### Rule 10: Never Guess Sponsorship
SponsorAJobs must never assume that an employer sponsors visas without concrete evidence. Clear distinctions must be maintained between explicit employer statements and contextual signals.

### Rule 11: Absolute Anti-Bot Compliance
Never bypass CAPTCHA, authentication walls, Cloudflare challenges, or anti-bot protections.

### Rule 12: Permitted Acquisition Only
Never acquire or republish data from a source where automated access or redistribution is prohibited by policy or terms of service.

### Rule 13: Recent Successful Verification Required
Every public job must have a verified check within its validity window (`verification_expires_at > CURRENT_TIMESTAMP`).

### Rule 14: Actionable Application Path Required
Every public job must maintain a live, verified destination link leading to the employer or an authorized ATS application form.

### Rule 15: Clean Schema.org Hygiene
Expired, unverified, or quarantined jobs must never remain active in Google `JobPosting` JSON-LD structured data or public XML sitemaps.

---

## 🔍 PUBLIC TRUST STANDARD

> *"If SponsorAJobs cannot prove that a job is currently actionable, SponsorAJobs must not present it as currently actionable."*
