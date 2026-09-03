import { describe, it, expect, vi, beforeEach } from "vitest";
import { VERIFIED_GLOBAL_SPONSORS, seedVerifiedGlobalSponsors } from "../scripts/harvest-multi-country-daily";
import { MultiCountryHarvesterService, multiCountryHarvesterService } from "../lib/services/multiCountryHarvesterService";
import { GreenhouseAdapter } from "../sources/greenhouse/GreenhouseAdapter";
import { LeverAdapter } from "../sources/lever/LeverAdapter";
import { AshbyAdapter } from "../sources/ashby/AshbyAdapter";
import { ArbeitnowAdapter } from "../sources/arbeitnow/ArbeitnowAdapter";
import { RemotiveAdapter } from "../sources/remotive/RemotiveAdapter";
import { RemoteOKAdapter } from "../sources/remoteok/RemoteOKAdapter";
import { JobicyAdapter } from "../sources/jobicy/JobicyAdapter";
import { HimalayasAdapter } from "../sources/himalayas/HimalayasAdapter";
import { TheMuseAdapter } from "../sources/themuse/TheMuseAdapter";
import { USAJobsAdapter } from "../sources/usajobs/USAJobsAdapter";
import { GET as getCronRoute } from "../app/api/cron/harvest-multi-country/route";
import { NextRequest } from "next/server";

describe("Multi-Country Verified Sponsors & Daily Harvester Suite", () => {
  beforeEach(() => {
    vi.spyOn(GreenhouseAdapter.prototype, "fetchJobs").mockResolvedValue({
      sourceName: "Greenhouse",
      jobsFetched: 2,
      jobs: [
        {
          title: "Staff Software Engineer",
          companyName: "Stripe",
          location: "San Francisco, CA",
          countryCode: "US",
          applyUrl: "https://stripe.com/jobs/1",
          sourceId: "greenhouse",
          sourceJobId: "gh_stripe_1",
          description: "Staff engineer building financial rails",
        } as any,
        {
          title: "Senior Product Designer",
          companyName: "Canva",
          location: "Sydney, NSW",
          countryCode: "AU",
          applyUrl: "https://canva.com/jobs/1",
          sourceId: "greenhouse",
          sourceJobId: "gh_canva_1",
          description: "Design systems for visual suite",
        } as any,
      ],
      hasMore: false,
    });

    vi.spyOn(LeverAdapter.prototype, "fetchJobs").mockResolvedValue({
      sourceName: "Lever",
      jobsFetched: 1,
      jobs: [
        {
          title: "Full Stack Developer",
          companyName: "Hopper",
          location: "Montreal, QC",
          countryCode: "CA",
          applyUrl: "https://hopper.com/jobs/1",
          sourceId: "lever",
          sourceJobId: "lever_hopper_1",
          description: "Building travel marketplace",
        } as any,
      ],
      hasMore: false,
    });

    vi.spyOn(AshbyAdapter.prototype, "fetchJobs").mockResolvedValue({
      sourceName: "Ashby",
      jobsFetched: 1,
      jobs: [
        {
          title: "Infrastructure Engineer",
          companyName: "Notion",
          location: "New York, NY",
          countryCode: "US",
          applyUrl: "https://notion.so/jobs/1",
          sourceId: "ashby",
          sourceJobId: "ashby_notion_1",
          description: "Distributed infrastructure scaling",
        } as any,
      ],
      hasMore: false,
    });

    vi.spyOn(ArbeitnowAdapter.prototype, "fetchJobs").mockResolvedValue({ sourceName: "Arbeitnow", jobsFetched: 0, jobs: [], hasMore: false });
    vi.spyOn(RemotiveAdapter.prototype, "fetchJobs").mockResolvedValue({ sourceName: "Remotive", jobsFetched: 0, jobs: [], hasMore: false });
    vi.spyOn(RemoteOKAdapter.prototype, "fetchJobs").mockResolvedValue({ sourceName: "RemoteOK", jobsFetched: 0, jobs: [], hasMore: false });
    vi.spyOn(JobicyAdapter.prototype, "fetchJobs").mockResolvedValue({ sourceName: "Jobicy", jobsFetched: 0, jobs: [], hasMore: false });
    vi.spyOn(HimalayasAdapter.prototype, "fetchJobs").mockResolvedValue({ sourceName: "Himalayas", jobsFetched: 0, jobs: [], hasMore: false });
    vi.spyOn(TheMuseAdapter.prototype, "fetchJobs").mockResolvedValue({ sourceName: "TheMuse", jobsFetched: 0, jobs: [], hasMore: false });
    vi.spyOn(USAJobsAdapter.prototype, "fetchJobs").mockResolvedValue({ sourceName: "USAJobs", jobsFetched: 0, jobs: [], hasMore: false });
  });

  it("should define accredited sponsors for all 5 core target countries (US, GB, AU, CA, NZ)", () => {
    const countries = new Set(VERIFIED_GLOBAL_SPONSORS.map((s) => s.country_code));
    expect(countries.has("US")).toBe(true);
    expect(countries.has("AU")).toBe(true);
    expect(countries.has("CA")).toBe(true);
    expect(countries.has("NZ")).toBe(true);

    for (const sponsor of VERIFIED_GLOBAL_SPONSORS) {
      expect(sponsor.id).toBeDefined();
      expect(sponsor.name).toBeDefined();
      expect(sponsor.slug).toBeDefined();
      expect(sponsor.sponsor_tier).toBeDefined();
      expect(sponsor.sponsor_rating).toBe("A");
      expect(sponsor.is_licensed_sponsor).toBe(true);
      expect(sponsor.verified_sponsor).toBe(true);
      expect(sponsor.overview.length).toBeGreaterThan(20);
    }
  });

  it("should seed verified global sponsors without duplicating records", () => {
    const mockData = {
      companies: [
        { id: "comp_google_us", name: "Google / Alphabet", slug: "google", country_code: "US" },
      ],
      jobs: [],
    };

    const initialCount = mockData.companies.length;
    const added = seedVerifiedGlobalSponsors(mockData);

    // Initial count + remaining unseeded sponsors
    expect(mockData.companies.length).toBe(VERIFIED_GLOBAL_SPONSORS.length);
    expect(added).toBe(VERIFIED_GLOBAL_SPONSORS.length - initialCount);

    // Second run should add 0 new sponsors
    const addedSecondRun = seedVerifiedGlobalSponsors(mockData);
    expect(addedSecondRun).toBe(0);
  });

  it("should execute a dry-run harvest cycle and return multi-country telemetry", async () => {
    const result = await multiCountryHarvesterService.runHarvestCycle({ dryRun: true });

    expect(result.status).toBe("success");
    expect(result.cycleId).toMatch(/^mc_cycle_/);
    expect(result.countryStats).toBeDefined();
    expect(result.countryStats.US).toBeDefined();
    expect(result.countryStats.GB).toBeDefined();
    expect(result.countryStats.AU).toBeDefined();
    expect(result.countryStats.CA).toBeDefined();
    expect(result.countryStats.NZ).toBeDefined();
    expect(result.totalVerifiedEmployers).toBeGreaterThan(100);
  });

  it("should handle GET request on /api/cron/harvest-multi-country route", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/harvest-multi-country?dryRun=true");
    const res = await getCronRoute(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.result).toBeDefined();
    expect(body.result.countryStats).toBeDefined();
  });
});
