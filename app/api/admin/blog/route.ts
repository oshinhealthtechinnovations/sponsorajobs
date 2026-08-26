import { NextRequest, NextResponse } from "next/server";
import { blogRepository } from "@/lib/repositories/blogRepository";
import { blogGenerator } from "@/lib/blog/generator";
import { verifyAdminSession } from "@/lib/services/adminAuth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;

  const result = await blogRepository.getAllPosts({ categorySlug: category, searchQuery: q, limit: 100 });

  return NextResponse.json({
    success: true,
    data: result.posts,
    total: result.total,
  });
}

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, countryCode, categorySlug, topicType, postId, isPublished } = body;

    if (action === "generate") {
      const generated = await blogGenerator.generateKeywordTargetedPost({
        countryCode: countryCode || undefined,
        categorySlug: categorySlug || undefined,
        topicType: topicType || "salary_guide",
      });

      return NextResponse.json({
        success: true,
        message: `Successfully generated article: "${generated.title}"`,
        post: generated,
      });
    }

    if (action === "toggle_publish") {
      if (!postId) {
        return NextResponse.json({ success: false, error: "Missing postId." }, { status: 400 });
      }

      const post = await blogRepository.getPostById(postId);
      if (!post) {
        return NextResponse.json({ success: false, error: "Post not found." }, { status: 404 });
      }

      post.isPublished = isPublished !== undefined ? isPublished : !post.isPublished;
      post.updatedAt = new Date().toISOString();
      await blogRepository.savePost(post);

      return NextResponse.json({
        success: true,
        message: `Post ${post.isPublished ? "published" : "unpublished"}.`,
        post,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
