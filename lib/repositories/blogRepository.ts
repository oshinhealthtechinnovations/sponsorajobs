import { BlogPostRecord, BlogFilterOptions } from "../types/blog";
import { INITIAL_BLOG_POSTS } from "../db/initialBlogPosts";

// Edge-safe in-memory cache seeded with initial high-authority pillar articles
let blogPostsStore: BlogPostRecord[] = [...INITIAL_BLOG_POSTS];

export class BlogRepository {
  /**
   * Get all published blog posts with optional filtering and pagination
   */
  async getAllPosts(options: BlogFilterOptions = {}): Promise<{
    posts: BlogPostRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      categorySlug,
      countryCode,
      searchQuery,
      isFeatured,
      page = 1,
      limit = 12,
    } = options;

    let filtered = blogPostsStore.filter((p) => p.isPublished);

    if (categorySlug) {
      filtered = filtered.filter(
        (p) => p.category.slug.toLowerCase() === categorySlug.toLowerCase()
      );
    }

    if (countryCode && countryCode !== "ALL") {
      filtered = filtered.filter(
        (p) => p.countryCode === countryCode || p.countryCode === "GLOBAL"
      );
    }

    if (isFeatured !== undefined) {
      filtered = filtered.filter((p) => Boolean(p.isFeatured) === isFeatured);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.targetKeywords.some((k) => k.toLowerCase().includes(q)) ||
          p.content.toLowerCase().includes(q)
      );
    }

    // Sort by publication date descending
    filtered.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      posts: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find a single post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPostRecord | null> {
    const cleanSlug = slug.toLowerCase().trim();
    const post = blogPostsStore.find(
      (p) => p.slug.toLowerCase() === cleanSlug && p.isPublished
    );
    return post || null;
  }

  /**
   * Find a post by ID
   */
  async getPostById(id: string): Promise<BlogPostRecord | null> {
    const post = blogPostsStore.find((p) => p.id === id);
    return post || null;
  }

  /**
   * Get featured pillar articles
   */
  async getFeaturedPosts(limit = 3): Promise<BlogPostRecord[]> {
    const featured = blogPostsStore.filter((p) => p.isPublished && p.isFeatured);
    if (featured.length >= limit) {
      return featured.slice(0, limit);
    }
    // Fallback to latest published if fewer featured
    const remaining = blogPostsStore
      .filter((p) => p.isPublished && !p.isFeatured)
      .slice(0, limit - featured.length);
    return [...featured, ...remaining];
  }

  /**
   * Get related posts for an article
   */
  async getRelatedPosts(currentPostId: string, limit = 3): Promise<BlogPostRecord[]> {
    const current = blogPostsStore.find((p) => p.id === currentPostId);
    if (!current) {
      return blogPostsStore.filter((p) => p.isPublished).slice(0, limit);
    }

    const related = blogPostsStore.filter(
      (p) =>
        p.isPublished &&
        p.id !== currentPostId &&
        (p.category.slug === current.category.slug ||
          (p.countryCode && p.countryCode === current.countryCode))
    );

    if (related.length < limit) {
      const others = blogPostsStore.filter(
        (p) => p.isPublished && p.id !== currentPostId && !related.includes(p)
      );
      return [...related, ...others].slice(0, limit);
    }

    return related.slice(0, limit);
  }

  /**
   * Get all distinct categories with published post counts
   */
  async getCategories(): Promise<{ name: string; slug: string; count: number }[]> {
    const map = new Map<string, { name: string; slug: string; count: number }>();

    for (const post of blogPostsStore.filter((p) => p.isPublished)) {
      const existing = map.get(post.category.slug);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(post.category.slug, {
          name: post.category.name,
          slug: post.category.slug,
          count: 1,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Programmatically insert or update a blog post
   */
  async savePost(post: BlogPostRecord): Promise<BlogPostRecord> {
    const idx = blogPostsStore.findIndex((p) => p.id === post.id || p.slug === post.slug);
    if (idx >= 0) {
      blogPostsStore[idx] = { ...post, updatedAt: new Date().toISOString() };
    } else {
      blogPostsStore.unshift(post);
    }
    return post;
  }

  /**
   * Get all published slugs for sitemap generation
   */
  async getAllPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    return blogPostsStore
      .filter((p) => p.isPublished)
      .map((p) => ({ slug: p.slug, updatedAt: p.updatedAt || p.publishedAt }));
  }
}

// Export singleton instance
export const blogRepository = new BlogRepository();
