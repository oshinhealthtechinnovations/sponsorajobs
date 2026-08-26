/**
 * Blog and Content Engine Type Definitions
 */

export interface BlogAuthor {
  name: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogPostRecord {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: {
    name: string;
    slug: string;
  };
  countryCode?: string;         // 'GB' | 'US' | 'AU' | 'CA' | 'NZ' | 'GLOBAL'
  targetKeywords: string[];
  excerpt: string;
  content: string;              // Formatted Markdown / HTML content
  author: BlogAuthor;
  readTimeMinutes: number;
  featuredImageUrl?: string;
  isFeatured?: boolean;
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
  faqs?: BlogFaqItem[];
  // Dynamic live job embed filter (queries real jobs database)
  jobEmbedQuery?: {
    countryCode?: string;
    categorySlug?: string;
    q?: string;
    limit?: number;
    title?: string;
  };
}

export interface BlogFilterOptions {
  categorySlug?: string;
  countryCode?: string;
  searchQuery?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}
