import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cleanHtmlToMarkdown } from "../normalization/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const realJobsPath = path.resolve(__dirname, "../lib/db/realJobsData.json");
const realData = JSON.parse(fs.readFileSync(realJobsPath, "utf-8"));

let cleanedCount = 0;
for (const job of realData.jobs) {
  if (job.description) {
    const cleaned = cleanHtmlToMarkdown(job.description);
    if (cleaned !== job.description) {
      job.description = cleaned;
      job.description_clean = cleaned;
      cleanedCount++;
    }
  }
}

fs.writeFileSync(realJobsPath, JSON.stringify(realData, null, 2), "utf-8");
console.log(`[Clean] Successfully sanitized and cleaned ${cleanedCount} jobs in realJobsData.json!`);
