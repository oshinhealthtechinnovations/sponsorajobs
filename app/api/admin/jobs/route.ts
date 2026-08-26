import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/client";
import { verifyAdminSession } from "@/lib/services/adminAuth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";

  const db = getDatabase();

  const conditions: string[] = [];
  const bindings: any[] = [];

  if (q) {
    conditions.push("(LOWER(j.title) LIKE ? OR LOWER(c.name) LIKE ?)");
    const term = `%${q.toLowerCase().trim()}%`;
    bindings.push(term, term);
  }

  if (status && status !== "all") {
    conditions.push("j.status = ?");
    bindings.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT j.*, c.name as company_name
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    ${whereClause}
    ORDER BY j.created_at DESC
    LIMIT 50
  `;

  const results = await db.prepare(sql).bind(...bindings).all<any>();

  return NextResponse.json({
    success: true,
    data: results.results,
  });
}

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, jobId, status, sponsorshipLabel, overrideReason } = body;
    const db = getDatabase();

    if (action === "update_status") {
      if (!jobId || !status) {
        return NextResponse.json({ success: false, error: "Missing jobId or status." }, { status: 400 });
      }

      await db.prepare(`
        UPDATE jobs
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(status, jobId).run();

      // Audit log
      const auditId = `audit_${Date.now()}`;
      await db.prepare(`
        INSERT INTO admin_action_log (id, admin, action, entity, entity_id, old_value, new_value, timestamp)
        VALUES (?, 'system_admin', 'UPDATE_JOB_STATUS', 'jobs', ?, NULL, ?, CURRENT_TIMESTAMP)
      `).bind(auditId, jobId, status).run();

      return NextResponse.json({ success: true, message: `Job ${jobId} status updated to ${status}.` });
    }

    if (action === "override_sponsorship") {
      if (!jobId || !sponsorshipLabel) {
        return NextResponse.json({ success: false, error: "Missing jobId or sponsorshipLabel." }, { status: 400 });
      }

      await db.prepare(`
        UPDATE jobs
        SET sponsorship_label = ?, sponsorship_confidence = 100, is_override = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(sponsorshipLabel, jobId).run();

      // Audit log
      const auditId = `audit_${Date.now()}`;
      await db.prepare(`
        INSERT INTO admin_action_log (id, admin, action, entity, entity_id, old_value, new_value, timestamp)
        VALUES (?, 'system_admin', 'OVERRIDE_SPONSORSHIP', 'jobs', ?, NULL, ?, CURRENT_TIMESTAMP)
      `).bind(auditId, jobId, `${sponsorshipLabel} (${overrideReason || 'Manual override'})`).run();

      return NextResponse.json({ success: true, message: `Job ${jobId} sponsorship overridden to ${sponsorshipLabel}.` });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
