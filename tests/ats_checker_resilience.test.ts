import { describe, it, expect } from "vitest";
import { GET as getJobs } from "@/app/api/jobs/route";
import { NextRequest } from "next/server";
import { JobRepository } from "@/lib/repositories/jobRepository";

describe("ATS Checker & Target Vacancy Route Resilience Tests", () => {
  const repo = new JobRepository();

  it("should lookup a specific job by ID safely and return complete public DTO", async () => {
    const jobs = await repo.findByIds(["job_gb_gordon-ramsay-restaurants_720096_20"]);
    expect(jobs).toBeDefined();
    expect(jobs.length).toBeGreaterThan(0);

    const job = jobs[0];
    expect(job.id).toBe("job_gb_gordon-ramsay-restaurants_720096_20");
    expect(job.title).toContain("Restaurant General Manager");
    expect(job.company).toBeDefined();
    expect(job.company.name).toBe("Gordon Ramsay Restaurants");
    expect(job.location).toBeDefined();
    expect(job.location.country).toBe("GB");
    expect(job.location.city).toBe("Woking");
  });

  it("should handle non-existent job IDs gracefully without throwing", async () => {
    const jobs = await repo.findByIds(["non_existent_fake_job_999999"]);
    expect(jobs).toBeDefined();
    expect(jobs.length).toBe(0);
  });

  it("should handle empty or malformed ID lists safely", async () => {
    const emptyJobs = await repo.findByIds([]);
    expect(emptyJobs).toEqual([]);

    const spacesOnly = await repo.findByIds(["", "   "]);
    expect(spacesOnly).toEqual([]);
  });

  it("should serve GET /api/jobs?ids=... route safely for target job benchmark", async () => {
    const req = new NextRequest(
      "https://sponsorajobs.com/api/jobs?ids=job_gb_gordon-ramsay-restaurants_720096_20"
    );
    const res = await getJobs(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.jobs).toBeDefined();
    expect(Array.isArray(data.jobs)).toBe(true);
    expect(data.jobs.length).toBe(1);
    expect(data.jobs[0].title).toContain("Restaurant General Manager");
    expect(data.jobs[0].company.name).toBe("Gordon Ramsay Restaurants");
  });

  it("should serve GET /api/jobs?ids=... safely when job is not found", async () => {
    const req = new NextRequest(
      "https://sponsorajobs.com/api/jobs?ids=job_missing_random_xyz"
    );
    const res = await getJobs(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.jobs).toBeDefined();
    expect(data.jobs.length).toBe(0);
    expect(data.total).toBe(0);
  });
});
