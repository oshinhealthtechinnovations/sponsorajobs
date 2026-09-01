import { NextRequest, NextResponse } from "next/server";
import { AlertRepository } from "@/lib/repositories/alertRepository";
import { CloudStorageService, StoredSubscriber } from "@/lib/services/cloudStorageService";
import { verifyAdminSession } from "@/lib/services/adminAuth";


export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminSession(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  const alertRepo = new AlertRepository();
  const dbAlerts = await alertRepo.getAllActiveAlerts();
  const cloudAlerts = await CloudStorageService.fetchAllSubscribers();

  // Deduplicate subscribers by email + keyword
  const subscriberMap = new Map<string, StoredSubscriber>();

  for (const a of [...cloudAlerts, ...dbAlerts]) {
    const key = `${a.email.toLowerCase()}__${a.keyword || "any"}`;
    if (!subscriberMap.has(key)) {
      subscriberMap.set(key, {
        id: a.id,
        email: a.email,
        keyword: a.keyword || null,
        country: (a as any).country_code || (a as any).country || "ALL",
        category: (a as any).category_id || (a as any).category || "ALL",
        frequency: (a as any).frequency || "daily",
        created_at: a.created_at,
        active: a.active ?? 1,
      });
    }
  }

  const subscribers = Array.from(subscriberMap.values());

  if (format === "csv") {
    const csvContent = CloudStorageService.generateCSV(subscribers);
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="job_alert_subscribers_${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    total: subscribers.length,
    subscribers,
  });
}

export async function POST(req: NextRequest) {
  const isAuthorized = await verifyAdminSession(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body?.email || !body.email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const alertRepo = new AlertRepository();
    const alertRecord = await alertRepo.createAlert({
      email: body.email,
      keyword: body.keyword,
      country: body.country,
      category: body.category,
      frequency: body.frequency || "daily",
    });

    await CloudStorageService.saveSubscriber({
      id: alertRecord.id,
      email: alertRecord.email,
      keyword: alertRecord.keyword,
      country: alertRecord.country_code,
      category: alertRecord.category_id,
      frequency: alertRecord.frequency,
      created_at: alertRecord.created_at,
      active: 1,
    });

    return NextResponse.json({ success: true, alert: alertRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
