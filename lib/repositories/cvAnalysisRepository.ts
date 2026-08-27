import { getDatabase, DatabaseClient } from "../db/client";
import { CVAnalysisRecord, CVAggregateStats } from "../types/database";
import { FullATSIntelligenceResult } from "../services/atsIntelligenceEngine";
import crypto from "crypto";

export interface SaveCVAnalysisOptions {
  userId?: string | null;
  rawText?: string;
  targetCountry?: string;
  targetJobId?: string | null;
}

export class CVAnalysisRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || getDatabase();
  }

  /**
   * Persists a completed CV Intelligence analysis into the database
   */
  async saveAnalysis(
    analysis: FullATSIntelligenceResult,
    options: SaveCVAnalysisOptions = {}
  ): Promise<CVAnalysisRecord> {
    const id = `cva_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const shareToken = `rep_${crypto.randomBytes(8).toString("hex")}`;
    const now = new Date().toISOString();

    const snippet = options.rawText ? options.rawText.slice(0, 1500) : null;
    const detectedSkillsJson = JSON.stringify(analysis.profile.technicalSkills || []);
    const missingSkillsJson = JSON.stringify(analysis.jobMatchDiagnostics.missingCriticalRequirements || []);
    const fullResultJson = JSON.stringify(analysis);

    const record: CVAnalysisRecord = {
      id,
      user_id: options.userId || null,
      candidate_email: analysis.profile.email || null,
      candidate_phone: analysis.profile.phone || null,
      target_country: analysis.sponsorshipDiagnostics.targetCountry || options.targetCountry || "GB",
      target_role: analysis.jobMatchDiagnostics.targetRoleTitle || "Software Engineer",
      soc_code: analysis.sponsorshipDiagnostics.occupationRule.socCode || null,
      seniority: analysis.profile.seniority,
      highest_degree: analysis.profile.highestDegree,
      years_experience: analysis.profile.estimatedYearsExperience,
      word_count: analysis.wordCount,
      overall_score: analysis.overallScore,
      cv_quality_score: analysis.cvQualityScore,
      ats_compatibility_score: analysis.atsDiagnostics.score,
      job_match_score: analysis.jobMatchDiagnostics.score,
      sponsorship_score: analysis.sponsorshipDiagnostics.score,
      parsing_risk: analysis.atsDiagnostics.parsingRisk,
      detected_skills: detectedSkillsJson,
      missing_skills: missingSkillsJson,
      raw_text_snippet: snippet,
      full_result_json: fullResultJson,
      share_token: shareToken,
      created_at: now,
      updated_at: now,
    };

    const sql = `
      INSERT INTO cv_analyses (
        id, user_id, candidate_email, candidate_phone, target_country, target_role, soc_code,
        seniority, highest_degree, years_experience, word_count, overall_score, cv_quality_score,
        ats_compatibility_score, job_match_score, sponsorship_score, parsing_risk,
        detected_skills, missing_skills, raw_text_snippet, full_result_json, share_token,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.prepare(sql).bind(
      record.id,
      record.user_id,
      record.candidate_email,
      record.candidate_phone,
      record.target_country,
      record.target_role,
      record.soc_code,
      record.seniority,
      record.highest_degree,
      record.years_experience,
      record.word_count,
      record.overall_score,
      record.cv_quality_score,
      record.ats_compatibility_score,
      record.job_match_score,
      record.sponsorship_score,
      record.parsing_risk,
      record.detected_skills,
      record.missing_skills,
      record.raw_text_snippet,
      record.full_result_json,
      record.share_token,
      record.created_at,
      record.updated_at
    ).run();

    return record;
  }

  /**
   * Retrieves an analysis record by its internal scan ID
   */
  async getById(id: string): Promise<CVAnalysisRecord | null> {
    const sql = `SELECT * FROM cv_analyses WHERE id = ?`;
    return await this.db.prepare(sql).bind(id).first<CVAnalysisRecord>();
  }

  /**
   * Retrieves an analysis record by its public share token
   */
  async getByShareToken(token: string): Promise<CVAnalysisRecord | null> {
    const sql = `SELECT * FROM cv_analyses WHERE share_token = ?`;
    return await this.db.prepare(sql).bind(token).first<CVAnalysisRecord>();
  }

  /**
   * Lists recent CV analyses (for admin intelligence and recent scans)
   */
  async listRecent(limit = 50, offset = 0): Promise<{ analyses: CVAnalysisRecord[]; total: number }> {
    const countSql = `SELECT COUNT(*) as total FROM cv_analyses`;
    const totalRow = await this.db.prepare(countSql).first<{ total: number }>();
    const total = totalRow?.total ?? 0;

    const dataSql = `SELECT * FROM cv_analyses ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const res = await this.db.prepare(dataSql).bind(limit, offset).all<CVAnalysisRecord>();

    return {
      analyses: res.results || [],
      total,
    };
  }

  /**
   * Aggregates intelligence across all scanned CVs on the platform
   */
  async getAggregateStats(): Promise<CVAggregateStats> {
    const { analyses, total } = await this.listRecent(500, 0);

    if (total === 0 || analyses.length === 0) {
      return {
        totalAnalyzed: 0,
        averageOverallScore: 0,
        averageSponsorshipScore: 0,
        topSkills: [],
        topMissingSkills: [],
        countryDistribution: [],
        socDistribution: [],
        seniorityDistribution: [],
      };
    }

    let sumOverall = 0;
    let sumSponsorship = 0;
    const skillCounts: Record<string, number> = {};
    const missingSkillCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const socCounts: Record<string, number> = {};
    const seniorityCounts: Record<string, number> = {};

    for (const a of analyses) {
      sumOverall += a.overall_score || 0;
      sumSponsorship += a.sponsorship_score || 0;

      // Track country
      const c = a.target_country || "Global";
      countryCounts[c] = (countryCounts[c] || 0) + 1;

      // Track SOC
      const soc = a.soc_code || "Unmapped";
      socCounts[soc] = (socCounts[soc] || 0) + 1;

      // Track Seniority
      const sen = a.seniority || "Mid-Level";
      seniorityCounts[sen] = (seniorityCounts[sen] || 0) + 1;

      // Track Detected Skills
      try {
        const skills: string[] = JSON.parse(a.detected_skills || "[]");
        skills.forEach((s) => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });
      } catch {}

      // Track Missing Skills
      try {
        const missing: string[] = JSON.parse(a.missing_skills || "[]");
        missing.forEach((m) => {
          missingSkillCounts[m] = (missingSkillCounts[m] || 0) + 1;
        });
      } catch {}
    }

    const sortMap = (map: Record<string, number>, keyName: string) => {
      return Object.entries(map)
        .map(([key, count]) => ({ [keyName]: key, count } as any))
        .sort((a, b) => b.count - a.count);
    };

    return {
      totalAnalyzed: total,
      averageOverallScore: Math.round(sumOverall / analyses.length),
      averageSponsorshipScore: Math.round(sumSponsorship / analyses.length),
      topSkills: sortMap(skillCounts, "skill").slice(0, 10),
      topMissingSkills: sortMap(missingSkillCounts, "skill").slice(0, 10),
      countryDistribution: sortMap(countryCounts, "country"),
      socDistribution: sortMap(socCounts, "socCode"),
      seniorityDistribution: sortMap(seniorityCounts, "seniority"),
    };
  }
}
