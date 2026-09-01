# Agent Guidelines & Memory for SponsorAJobs

## Automatic Redeployment Rule (Permanent Memory)
Whenever any changes, fixes, or additions are made to the codebase:
1. **Automated Verification:** Run `npm test` and `npm run build` to ensure all tests pass and the production build compiles cleanly.
2. **Auto-Deploy on Every Change:** Stage changed files, commit with a clear semantic message, and push directly to `origin/main` to trigger the production deployment on Vercel.
3. **Report Status:** Always inform the user of what changed, the test results, and the live deployment status (commit SHA).
