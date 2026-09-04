# Agent Guidelines & Memory for SponsorAJobs

## Automatic Redeployment Rule (Permanent Memory)
Whenever any changes, fixes, or additions are made to the codebase:
1. **Automated Verification:** Run `npm test` and `npm run build` to ensure all tests pass and the production build compiles cleanly.
2. **Auto-Deploy on Every Change:** Stage changed files, commit with a clear semantic message, and push directly to `origin/main` to trigger the production deployment on Vercel.
3. **Report Status:** Always inform the user of what changed, the test results, and the live deployment status (commit SHA).

## Email & Domain Configuration (Permanent Memory)
- **Domain:** `sponsorajobs.com`
- **DNS Provider:** DirectAdmin Hosting (`benz.herosite.pro`)
- **Direct Domain Mailboxes (POP/IMAP/SMTP):**
  - **Host / Server:** `mail.sponsorajobs.com` (Port 587 TLS / Port 465 SSL)
  - **DirectAdmin Server:** `benz.herosite.pro`
  - **Account 1 (Support):** `support@sponsorajobs.com` | Password: `Os@626461`
  - **Account 2 (Sumit / Admin):** `sumit@sponsorajobs.com` | Password: `Os@626461`
- **Transactional Email Service:** Resend (`api.resend.com`), Direct Domain SMTP (`mail.sponsorajobs.com:587`), & Gmail SMTP Relay (`smtp.gmail.com:465`)
- **Sender Address:** `SponsorAJobs <auth@sponsorajobs.com>` / `support@sponsorajobs.com`
- **Authentication:** Stateless HMAC-SHA256 `pendingToken` for seamless serverless candidate OTP verification.
- **AI Campaign API:** OpenRouter configured (`OPENROUTER_API_KEY`).
- **Telegram:** Telegram integrations are completely disabled across the platform.


