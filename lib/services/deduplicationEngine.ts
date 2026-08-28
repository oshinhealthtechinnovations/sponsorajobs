import crypto from "crypto";
import { JobRecord } from "../types/database";

export interface DeduplicationResult {
  isDuplicate: boolean;
  canonicalHash: string;
  matchedPriority?: number; // 1 to 5
  matchedJobId?: string;
  mergeReason?: string;
}

export class DeduplicationEngine {
  /**
   * Computes a resilient canonical hash using the 5-tier priority hierarchy
   */
  static computeCanonicalHash(
    sourceId: string,
    sourceJobId?: string | null,
    canonicalUrl?: string | null,
    companyName: string = "",
    title: string = "",
    location: string = ""
  ): string {
    // Tier 1: Source ID + Stable Source Job ID
    if (sourceId && sourceJobId && sourceJobId.trim().length > 2) {
      return `hash_s_${sourceId}_${sourceJobId.trim()}`;
    }

    // Tier 2: Normalized Canonical URL
    if (canonicalUrl && canonicalUrl.startsWith("http")) {
      const urlHash = crypto.createHash("sha256").update(canonicalUrl.toLowerCase().trim()).digest("hex").slice(0, 20);
      return `hash_url_${urlHash}`;
    }

    // Tier 4: Normalized Entity tuple
    const normComp = (companyName || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
    const normTitle = (title || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
    const normLoc = (location || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

    const tupleHash = crypto
      .createHash("sha256")
      .update(`${normComp}_${normTitle}_${normLoc}`)
      .digest("hex")
      .slice(0, 24);

    return `hash_entity_${tupleHash}`;
  }

  /**
   * Checks for duplicate presence against existing repository records
   */
  static findDuplicate(
    candidate: {
      sourceId: string;
      sourceJobId?: string | null;
      canonicalUrl?: string | null;
      companyName: string;
      title: string;
      location: string;
      description?: string;
    },
    existingJobs: JobRecord[]
  ): DeduplicationResult {
    const computedHash = this.computeCanonicalHash(
      candidate.sourceId,
      candidate.sourceJobId,
      candidate.canonicalUrl,
      candidate.companyName,
      candidate.title,
      candidate.location
    );

    // Priority 1: Exact Source ID + Source Job ID match
    if (candidate.sourceJobId) {
      const matchP1 = existingJobs.find(
        (j) => j.source_id === candidate.sourceId && j.source_job_id === candidate.sourceJobId
      );
      if (matchP1) {
        return {
          isDuplicate: true,
          canonicalHash: computedHash,
          matchedPriority: 1,
          matchedJobId: matchP1.id,
          mergeReason: "Matched existing job by source_id and source_job_id",
        };
      }
    }

    // Priority 2: Canonical Hash / Canonical URL match
    const matchP2 = existingJobs.find(
      (j) => j.canonical_hash === computedHash || (candidate.canonicalUrl && j.canonical_url === candidate.canonicalUrl)
    );
    if (matchP2) {
      return {
        isDuplicate: true,
        canonicalHash: computedHash,
        matchedPriority: 2,
        matchedJobId: matchP2.id,
        mergeReason: "Matched existing job by canonical URL / hash",
      };
    }

    // Priority 4: Normalized Employer + Title + Location match
    const cNormComp = candidate.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const cNormTitle = candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const cNormLoc = candidate.location.toLowerCase().replace(/[^a-z0-9]+/g, "");

    const matchP4 = existingJobs.find((j) => {
      const jNormComp = (j.company_id || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
      const jNormTitle = (j.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
      const jNormLoc = (j.location || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

      return cNormComp.length > 2 && cNormTitle.length > 2 && cNormComp === jNormComp && cNormTitle === jNormTitle && cNormLoc === jNormLoc;
    });

    if (matchP4) {
      return {
        isDuplicate: true,
        canonicalHash: computedHash,
        matchedPriority: 4,
        matchedJobId: matchP4.id,
        mergeReason: "Matched existing job by normalized employer, title, and location tuple",
      };
    }

    return {
      isDuplicate: false,
      canonicalHash: computedHash,
    };
  }
}
