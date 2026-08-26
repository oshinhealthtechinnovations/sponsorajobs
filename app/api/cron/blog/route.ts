import { NextResponse } from "next/server";
import { blogGenerator } from "@/lib/blog/generator";

export const runtime = "edge";

/**
 * Automated Cron Worker for Blog Post Publishing
 * Generates and publishes targeted SEO articles periodically
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SECRET;

    // Optional secret verification if configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(request.url);
      if (url.searchParams.get("key") !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const newPost = await blogGenerator.generateKeywordTargetedPost();

    return NextResponse.json({
      success: true,
      message: "Automated SEO blog post published successfully",
      post: {
        id: newPost.id,
        slug: newPost.slug,
        title: newPost.title,
        publishedAt: newPost.publishedAt,
      },
    });
  } catch (err: any) {
    console.error("Error in blog cron generator:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate blog post" },
      { status: 500 }
    );
  }
}
