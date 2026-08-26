import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { blogRepository } from "@/lib/repositories/blogRepository";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import {
  generateBlogPostingSchema,
  generateFaqSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schema";
import {
  Clock,
  Calendar,
  User,
  ChevronRight,
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Briefcase,
  ExternalLink,
  BookOpen,
} from "lucide-react";

export const runtime = "edge";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await blogRepository.getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found | SponsorAJobs",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.metaTitle}`,
    description: post.metaDescription,
    keywords: post.targetKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.targetKeywords,
      images: [
        {
          url: post.featuredImageUrl || `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [post.featuredImageUrl || `${siteUrl}/og-image.png`],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await blogRepository.getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = await blogRepository.getRelatedPosts(post.id, 3);

  // Fetch live matching jobs for the article embed
  const jobRepo = new JobRepository();
  let liveJobs: any[] = [];
  if (post.jobEmbedQuery) {
    try {
      const searchRes = await jobRepo.searchJobs({
        country: post.jobEmbedQuery.countryCode,
        category: post.jobEmbedQuery.categorySlug,
        q: post.jobEmbedQuery.q,
        limit: post.jobEmbedQuery.limit || 3,
      });
      liveJobs = searchRes.jobs || [];
    } catch (err) {
      console.error("Error fetching live jobs for blog embed:", err);
    }
  }

  // Schema generation
  const blogSchema = generateBlogPostingSchema({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.author.name,
    featuredImageUrl: post.featuredImageUrl,
    categoryName: post.category.name,
  });

  const faqSchema = post.faqs && post.faqs.length > 0 ? generateFaqSchema(post.faqs) : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.category.name, url: `/blog?category=${post.category.slug}` },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* ── JSON-LD Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* ── Article Header Banner ── */}
        <header className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="text-brand-300 hover:text-white transition-colors font-medium"
              >
                {post.category.name}
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-400/30">
                {post.category.name}
              </span>
              {post.countryCode && post.countryCode !== "GLOBAL" && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  📍 {post.countryCode} Focus
                </span>
              )}
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMinutes} min read
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-[1.2]">
              {post.title}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-600/40 border border-brand-400/40 flex items-center justify-center text-sm font-bold text-brand-200">
                  {post.author.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{post.author.name}</p>
                  <p className="text-slate-400 text-xs">{post.author.role}</p>
                </div>
              </div>

              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Guides</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ── Main Article Body Layout ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Article Markdown Body */}
          <article className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-sm">
            <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h3:text-xl prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-brand-600 hover:prose-a:underline">
              {post.content.split("\n").map((line, idx) => {
                if (line.startsWith("# ")) {
                  return (
                    <h1 key={idx} className="text-3xl font-black font-display text-slate-900 mt-2 mb-6">
                      {line.replace("# ", "")}
                    </h1>
                  );
                }
                if (line.startsWith("## ")) {
                  return (
                    <h2
                      key={idx}
                      className="text-2xl font-bold font-display text-slate-900 mt-10 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>{line.replace("## ", "")}</span>
                    </h2>
                  );
                }
                if (line.startsWith("### ")) {
                  return (
                    <h3 key={idx} className="text-lg font-bold font-display text-slate-900 mt-6 mb-2">
                      {line.replace("### ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("> ")) {
                  return (
                    <div
                      key={idx}
                      className="my-6 p-4 rounded-xl bg-brand-50/80 border-l-4 border-brand-600 text-brand-900 text-sm italic"
                    >
                      {line.replace("> ", "")}
                    </div>
                  );
                }
                if (line.startsWith("* ") || line.startsWith("- ")) {
                  return (
                    <li key={idx} className="ml-4 list-disc text-sm sm:text-base text-slate-700 my-1">
                      {line.replace(/^(\* |- )/, "")}
                    </li>
                  );
                }
                if (/^\d+\.\s/.test(line)) {
                  return (
                    <li key={idx} className="ml-4 list-decimal text-sm sm:text-base text-slate-700 my-1">
                      {line.replace(/^\d+\.\s/, "")}
                    </li>
                  );
                }
                if (line.trim() === "---") {
                  return <hr key={idx} className="my-8 border-slate-200" />;
                }
                if (!line.trim()) {
                  return <div key={idx} className="h-3" />;
                }
                return (
                  <p key={idx} className="text-sm sm:text-base text-slate-700 leading-relaxed my-3">
                    {line}
                  </p>
                );
              })}
            </div>
          </article>

          {/* ── Live Matching Jobs Widget ── */}
          {liveJobs.length > 0 && (
            <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Real-Time Matching Openings</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {post.jobEmbedQuery?.title || "Active Jobs With Visa Sponsorship"}
                  </h3>
                </div>

                <Link
                  href={
                    post.jobEmbedQuery?.countryCode
                      ? `/jobs/${post.jobEmbedQuery.countryCode.toLowerCase()}`
                      : "/jobs"
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shrink-0"
                >
                  <span>Browse All Jobs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {liveJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </section>
          )}

          {/* ── FAQ Accordion Section (If FAQs present) ── */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-brand-600">
                <HelpCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold font-display text-slate-900">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-4">
                {post.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2"
                  >
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-start gap-2">
                      <span className="text-brand-600">Q:</span>
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-5">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Author Bio Card ── */}
          <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-base shrink-0">
              {post.author.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Written by {post.author.name}
              </h4>
              <p className="text-xs text-slate-500">{post.author.role}</p>
              {post.author.bio && (
                <p className="text-xs text-slate-600 leading-relaxed">{post.author.bio}</p>
              )}
            </div>
          </div>

          {/* ── Related Guides ── */}
          {relatedPosts.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                <span>Related Visa & Career Guides</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500/40 transition-all hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                        {r.category.name}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {r.title}
                      </h4>
                    </div>
                    <span className="mt-4 text-xs font-semibold text-slate-400 group-hover:text-brand-600 flex items-center gap-1">
                      Read Guide →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Newsletter Signup ── */}
          <JobAlertSignup />
        </div>
      </main>

      <Footer />
    </div>
  );
}
