import fs from "fs";
import path from "path";

const dataPath = path.resolve("./lib/db/realJobsData.json");
const raw = fs.readFileSync(dataPath, "utf-8");
const data = JSON.parse(raw);

data.jobs = (data.jobs || []).map((j: any) => {
  if (typeof j.quality_score === "object" && j.quality_score !== null) {
    j.quality_score = j.quality_score.score || 85;
  } else if (typeof j.quality_score !== "number") {
    j.quality_score = Number(j.quality_score) || 85;
  }
  return j;
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
console.log("Sanitized quality scores for all jobs!");
