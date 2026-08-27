import { getDatabase, DatabaseClient } from "../db/client";
import { ShortlistRequestRecord, ShortlistMatchRecord } from "../types/database";
import { PublicJobDTO } from "../types/job";
import crypto from "crypto";

export interface CreateShortlistInput {
  candidateId?: string | null;
  email: string;
  targetCountry?: string;
  targetRole?: string;
  sponsorshipPreference?: string;
  minimumMatchScore?: number;
  skillsSnapshot?: string[];
}

export class ShortlistRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || getDatabase();
  }

  /**
   * Subscribes a candidate to automatic background shortlist alerts
   */
  async createRequest(input: CreateShortlistInput): Promise<ShortlistRequestRecord> {
    const id = `shl_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const now = new Date().toISOString();

    const record: ShortlistRequestRecord = {
      id,
      candidate_id: input.candidateId || null,
      email: input.email.trim().toLowerCase(),
      target_country: input.targetCountry || "GB",
      target_role: input.targetRole || "Software Engineer",
      sponsorship_preference: input.sponsorshipPreference || "required",
      minimum_match_score: input.minimumMatchScore || 70,
      skills_snapshot: JSON.stringify(input.skillsSnapshot || []),
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    };

    const sql = `
      INSERT INTO shortlist_requests (
        id, candidate_id, email, target_country, target_role,
        sponsorship_preference, minimum_match_score, skills_snapshot,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.prepare(sql).bind(
      record.id,
      record.candidate_id,
      record.email,
      record.target_country,
      record.target_role,
      record.sponsorship_preference,
      record.minimum_match_score,
      record.skills_snapshot,
      record.status,
      record.created_at,
      record.updated_at
    ).run();

    return record;
  }

  /**
   * Background Matcher: Matches a newly ingested job against active candidate shortlists
   */
  async matchJobAgainstActiveShortlists(
    job: PublicJobDTO,
    matchScore: number,
    sponsorshipScore: number
  ): Promise<ShortlistMatchRecord[]> {
    const sql = `SELECT * FROM shortlist_requests WHERE status = 'ACTIVE'`;
    const res = await this.db.prepare(sql).all<ShortlistRequestRecord>();
    const activeRequests = res.results || [];
    const createdMatches: ShortlistMatchRecord[] = [];

    for (const req of activeRequests) {
      if (req.target_country !== "GLOBAL" && req.target_country !== job.location.country) {
        continue;
      }

      if (matchScore >= req.minimum_match_score) {
        const matchId = `shm_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
        const now = new Date().toISOString();

        const matchRecord: ShortlistMatchRecord = {
          id: matchId,
          shortlist_request_id: req.id,
          job_id: job.id,
          match_score: matchScore,
          sponsorship_score: sponsorshipScore,
          status: "PENDING",
          created_at: now,
          sent_at: null,
        };

        const insertSql = `
          INSERT INTO shortlist_matches (
            id, shortlist_request_id, job_id, match_score,
            sponsorship_score, status, created_at, sent_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
          await this.db.prepare(insertSql).bind(
            matchRecord.id,
            matchRecord.shortlist_request_id,
            matchRecord.job_id,
            matchRecord.match_score,
            matchRecord.sponsorship_score,
            matchRecord.status,
            matchRecord.created_at,
            matchRecord.sent_at
          ).run();

          createdMatches.push(matchRecord);
        } catch (err) {
          // Ignore duplicate constraint
        }
      }
    }

    return createdMatches;
  }
}
