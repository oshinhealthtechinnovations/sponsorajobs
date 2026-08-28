import crypto from "crypto";
import { RawJobRecord } from "../types/database";

export interface RawIngestInput {
  sourceId: string;
  sourceJobId?: string;
  sourceUrl?: string;
  fetchedUrl?: string;
  finalUrl?: string;
  rawPayload: string;
  httpStatus?: number;
  responseContentType?: string;
  parserVersion?: string;
}

export class RawIngestionService {
  /**
   * Encapsulates raw payload ingestion and generates an immutable RawJobRecord
   */
  static createRawJobRecord(input: RawIngestInput): RawJobRecord {
    const rawPayloadString = typeof input.rawPayload === "string" ? input.rawPayload : JSON.stringify(input.rawPayload);
    
    // Deterministic content hash over raw payload
    const contentHash = crypto.createHash("sha256").update(rawPayloadString).digest("hex");
    
    const id = `raw_${input.sourceId}_${contentHash.slice(0, 16)}`;

    return {
      id,
      source_id: input.sourceId,
      source_job_id: input.sourceJobId || null,
      source_url: input.sourceUrl || null,
      fetched_url: input.fetchedUrl || null,
      final_url: input.finalUrl || null,
      raw_payload: rawPayloadString,
      content_hash: contentHash,
      http_status: input.httpStatus || 200,
      response_content_type: input.responseContentType || "application/json",
      fetched_at: new Date().toISOString(),
      parser_version: input.parserVersion || "v1.0",
      processing_status: "PENDING",
      created_at: new Date().toISOString(),
    };
  }
}
