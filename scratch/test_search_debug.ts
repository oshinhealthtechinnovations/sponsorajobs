import { getDatabase } from "../lib/db/client";
import { JobRepository } from "../lib/repositories/jobRepository";

async function run() {
  const db = getDatabase();
  const repo = new JobRepository();

  const countSql = "SELECT COUNT(*) as total FROM jobs j LEFT JOIN companies c ON j.company_id = c.id WHERE j.status = 'active' AND (LOWER(j.title) LIKE ? OR LOWER(j.description) LIKE ? OR LOWER(c.name) LIKE ?)";
  const bindings = ["%civil%", "%civil%", "%civil%"];
  
  const allRes = await db.prepare(countSql).bind(...bindings).all();
  console.log("allRes:", allRes);

  const firstRes = await db.prepare(countSql).bind(...bindings).first();
  console.log("firstRes:", firstRes);

  const searchRes = await repo.search({ q: "civil" });
  console.log("searchRes total:", searchRes.total, "jobs count:", searchRes.jobs.length);
}

run().catch(console.error);
