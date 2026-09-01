import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/client";
import { IngestionService } from "@/lib/services/ingestionService";
import { SourceRegistry } from "@/sources/registry";
import { verifyAdminSession } from "@/lib/services/adminAuth";


export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  const db = getDatabase();
  const res = await db.prepare("SELECT * FROM sources ORDER BY name ASC").all<any>();
  return NextResponse.json({
    success: true,
    data: res.results,
  });
}

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, sourceId, active } = body;
    const db = getDatabase();

    if (action === "toggle") {
      if (!sourceId) {
        return NextResponse.json({ success: false, error: "Missing sourceId." }, { status: 400 });
      }

      await db.prepare(`
        UPDATE sources
        SET active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(active ? 1 : 0, sourceId).run();

      // Audit log
      const auditId = `audit_${Date.now()}`;
      await db.prepare(`
        INSERT INTO admin_action_log (id, admin, action, entity, entity_id, old_value, new_value, timestamp)
        VALUES (?, 'system_admin', 'TOGGLE_SOURCE', 'sources', ?, NULL, ?, CURRENT_TIMESTAMP)
      `).bind(auditId, sourceId, active ? "ENABLED" : "DISABLED").run();

      return NextResponse.json({ success: true, message: `Source ${sourceId} toggled to ${active ? 'active' : 'disabled'}` });
    }

    if (action === "run_now") {
      if (!sourceId) {
        return NextResponse.json({ success: false, error: "Missing sourceId." }, { status: 400 });
      }

      const registry = new SourceRegistry();
      const service = new IngestionService(db, registry);
      const report = await service.processSource(sourceId);

      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
