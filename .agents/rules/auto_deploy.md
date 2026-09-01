# Automatic Deployment & Change Protocol

Whenever any code modifications, fixes, or feature updates are completed in this repository:

1. **Verify Quality:** Run tests (`npm test`) and production build verification (`npm run build`) to ensure zero errors.
2. **Commit & Redeploy Automatically:** Stage modified files (`git add ...`), create a descriptive semantic commit (`git commit -m "..."`), and immediately push to `origin/main` (`git push origin main`) to trigger the live Vercel redeployment.
3. **Notify User:** Always clearly notify the user with the commit hash and deployment confirmation once the push is completed.
