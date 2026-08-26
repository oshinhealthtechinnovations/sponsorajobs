import { describe, it, expect } from "vitest";
import { blogRepository } from "../lib/repositories/blogRepository";
import { blogGenerator } from "../lib/blog/generator";
import { generateBlogPostingSchema, generateFaqSchema } from "../lib/seo/schema";
import { parseInlineMarkdown } from "../components/MarkdownContent";
import sitemap from "../app/sitemap";

describe("Automated SEO Blog Engine & Schema Verification", () => {
  // 1. Initial High-Authority Posts
  it("should have pre-seeded high authority visa guides", async () => {
    const { posts, total } = await blogRepository.getAllPosts();
    expect(total).toBeGreaterThanOrEqual(6);
    expect(posts.some((p) => p.slug === "uk-skilled-worker-visa-sponsorship-guide-2026")).toBe(true);
    expect(posts.some((p) => p.slug === "top-tech-companies-sponsoring-visas-uk-usa-canada")).toBe(true);
  });

  // 2. Querying by slug
  it("should retrieve a post accurately by slug", async () => {
    const post = await blogRepository.getPostBySlug("uk-skilled-worker-visa-sponsorship-guide-2026");
    expect(post).toBeDefined();
    expect(post?.countryCode).toBe("GB");
    expect(post?.targetKeywords.length).toBeGreaterThan(0);
    expect(post?.faqs?.length).toBeGreaterThan(0);
  });

  // 3. Category filtering and distinct categories
  it("should retrieve distinct categories with count", async () => {
    const categories = await blogRepository.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c) => c.slug === "visa-guides")).toBe(true);
  });

  // 4. Automated Blog Generator
  it("should automatically generate a new keyword-targeted article", async () => {
    const generated = await blogGenerator.generateKeywordTargetedPost({
      countryCode: "GB",
      categorySlug: "information-technology",
      topicType: "salary_guide",
    });

    expect(generated.id).toBeDefined();
    expect(generated.slug).toContain("information-technology-salaries-visa-sponsorship-uk");
    expect(generated.isPublished).toBe(true);
    expect(generated.targetKeywords.length).toBeGreaterThan(0);

    const fetched = await blogRepository.getPostBySlug(generated.slug);
    expect(fetched).toBeDefined();
    expect(fetched?.title).toBe(generated.title);
  });

  // 5. BlogPosting JSON-LD Schema
  it("should generate valid Google BlogPosting schema", () => {
    const schema = generateBlogPostingSchema({
      title: "How to get a UK Visa in 2026",
      excerpt: "Step by step guide",
      slug: "uk-visa-guide-2026",
      publishedAt: "2026-08-20T00:00:00Z",
      authorName: "Alistair Campbell",
      categoryName: "Visa Guides",
    });

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.headline).toBe("How to get a UK Visa in 2026");
    expect(schema.author["@type"]).toBe("Person");
    expect(schema.publisher.name).toBe("SponsorAJobs");
    expect(schema.mainEntityOfPage["@id"]).toContain("/blog/uk-visa-guide-2026");
  });

  // 6. FAQPage JSON-LD Schema
  it("should generate valid Google FAQPage schema", () => {
    const faqSchema = generateFaqSchema([
      { question: "Can I bring family on UK visa?", answer: "Yes, eligible dependants are allowed." },
      { question: "How long does processing take?", answer: "Typically 3 weeks outside UK." },
    ]);

    expect(faqSchema["@context"]).toBe("https://schema.org");
    expect(faqSchema["@type"]).toBe("FAQPage");
    expect(faqSchema.mainEntity.length).toBe(2);
    expect(faqSchema.mainEntity[0].name).toBe("Can I bring family on UK visa?");
    expect(faqSchema.mainEntity[0].acceptedAnswer.text).toBe("Yes, eligible dependants are allowed.");
  });

  // 7. Dynamic Sitemap Inclusion
  it("should include /blog and all /blog/[slug] in the sitemap generator", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain("https://sponsorajobs.com/blog");
    expect(urls).toContain("https://sponsorajobs.com/blog/uk-skilled-worker-visa-sponsorship-guide-2026");
  });

  // 8. Markdown Parser Test (No raw asterisks)
  it("should parse bold and links without leaving raw asterisks", () => {
    const parsed = parseInlineMarkdown(
      "Securing a job in the United Kingdom as an international professional requires navigating the **UK Skilled Worker Visa route**. In this definitive guide..."
    );

    // Should return React nodes containing a strong element
    expect(parsed.length).toBeGreaterThan(1);
    const hasBold = parsed.some(
      (node: any) => node && typeof node === "object" && node.type === "strong"
    );
    expect(hasBold).toBe(true);
  });
});

