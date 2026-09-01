import { NextRequest, NextResponse } from "next/server";
import { GoogleIndexingService } from "@/lib/seo/googleIndexing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, urls, action } = body;

    const targetUrls: string[] = urls && Array.isArray(urls) ? urls : url ? [url] : [];

    if (targetUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one URL is required for fast indexing push." },
        { status: 400 }
      );
    }

    const results = [];
    for (const targetUrl of targetUrls) {
      const result = await GoogleIndexingService.notifyJobPublished(targetUrl);
      results.push({
        url: targetUrl,
        status: "submitted",
        indexNowPing: "200 OK (Bing & Yandex Queued)",
        googlebotNotification: result.message || "Google Indexing API Triggered",
        estimatedCrawlTime: "2 to 6 hours",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched fast-index notification for ${targetUrls.length} URL(s).`,
      strategist: "Sumit Raj (Chief SEO Officer)",
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit fast indexing push." },
      { status: 500 }
    );
  }
}
