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
import { MarkdownContent } from "@/components/MarkdownContent";
import { BlogReadingProgressBar } from "@/components/BlogReadingProgressBar";
import { BlogShareButtons } from "@/components/BlogShareButtons";
import { BlogInteractiveFaq } from "@/components/BlogInteractiveFaq";
import {
  generateBlogPostingSchema,
  generateFaqSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schema";
import {
  Clock,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  BookOpen,
  ListTree,
  Tag,
  Wand2,
  ArrowRight,
  Briefcase,
  Flame,
} from "lucide-react";

export const revalidate = 3600;

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

  // Extract Table of Contents from markdown headings (## Heading)
  const headings = post.content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const text = line.replace("## ", "").trim();
      const anchorId = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      return { text, anchorId };
    });

  // Query live jobs for embed query
  const jobRepo = new JobRepository();
  let liveJobs: any[] = [];
  try {
    const { countryCode, categorySlug, q, limit = 3 } = post.jobEmbedQuery || {
      countryCode: post.countryCode !== "GLOBAL" ? post.countryCode : undefined,
      limit: 3,
    };
    const res = await jobRepo.search({
      country: countryCode,
      category: categorySlug,
      q,
      limit,
      sort: "sponsorship",
    });
    liveJobs = res.jobs;
  } catch {
    liveJobs = [];
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
    { name: "Guides", url: "/blog" },
    { name: post.category.name, url: `/blog?category=${post.category.slug}` },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* ── Top Reading Progress Bar (Stripe/Medium Style) ── */}
      <BlogReadingProgressBar />

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
        {/* ── Stripe / Linear Style Editorial Hero Header ── */}
        <header className="bg-white border-b border-slate-200/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto space-y-5">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
              <Link href="/" className="hover:text-brand-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/blog" className="hover:text-brand-600 transition-colors">
                Visa Guides &amp; Intelligence
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold">{post.category.name}</span>
            </nav>

            {/* Badges & Meta Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-black border border-brand-200 uppercase tracking-wider shadow-sm">
                {post.category.name}
              </span>
              {post.countryCode && post.countryCode !== "GLOBAL" && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  📍 {post.countryCode} Jurisdiction
                </span>
              )}
              <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {post.readTimeMinutes} min read
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Main Article Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-slate-900 tracking-tight leading-[1.15] max-w-4xl">
              {post.title}
            </h1>

            {/* Subtitle / Excerpt */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl font-sans">
              {post.excerpt}
            </p>

            {/* Author Profile & Social Share Drawer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold tracking-wider shadow-sm">
                  {post.author.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{post.author.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500">{post.author.role}</p>
                </div>
              </div>

              {/* Share Buttons */}
              <BlogShareButtons title={post.title} url={articleUrl} />
            </div>
          </div>
        </header>

        {/* ── 2-Column Responsive Layout ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left / Main Content Column (68%) ── */}
            <div className="lg:col-span-8 space-y-8">
              {/* Key Takeaways Summary Box (Harvard Business Review Style) */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white border border-slate-700 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-brand-400 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Key Intelligence Summary (TL;DR)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Essential Takeaways from this 2026 Guide:
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>All criteria reflect updated {new Date().getFullYear()} statutory salary thresholds and official government sponsor registers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Apply directly via accredited employer career systems to bypass unverified recruitment agencies.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Calibrate your technical resume against standardized SOC 2020 occupational taxonomies for 90%+ ATS screen pass rates.</span>
                  </li>
                </ul>
              </div>

              {/* Prose Markdown Body Container */}
              <article className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-sm leading-relaxed text-slate-800 text-sm sm:text-base space-y-6">
                <MarkdownContent content={post.content} />
              </article>

              {/* High-Converting In-Article CV Match CTA (Levels.fyi / Linear Style) */}
              <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-5 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Deterministic Recommendation Engine</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Want to Know If Your CV Matches These Sponsoring Roles?
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Upload your CV to run our deterministic matching engine against 690+ verified sponsor jobs. Get an instant score, exact skill gap breakdown, and statutory salary verification.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/tools/cv-job-match"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-brand-500 hover:from-cyan-300 hover:to-brand-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <span>Run Free CV Match Scan</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/tools/ats-checker"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-colors"
                  >
                    <span>Audit ATS Score (90%+)</span>
                  </Link>
                </div>
              </div>

              {/* Related Topics & Search Keywords */}
              {post.targetKeywords && post.targetKeywords.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-wrap items-center gap-2 text-xs shadow-sm">
                  <span className="font-bold text-slate-500 flex items-center gap-1 mr-2">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    <span>Search Topics:</span>
                  </span>
                  {post.targetKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200/80"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Live Matching Jobs Stream */}
              {liveJobs.length > 0 && (
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Live Matching Opportunities</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-0.5">
                        Active Sponsor Jobs In This Sector
                      </h3>
                    </div>
                    <Link
                      href={post.countryCode && post.countryCode !== "GLOBAL" ? `/jobs/${post.countryCode.toLowerCase()}` : "/jobs"}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                      <span>View All ({liveJobs.length}+)</span>
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

              {/* Interactive FAQ Accordion Component */}
              {post.faqs && post.faqs.length > 0 && (
                <BlogInteractiveFaq faqs={post.faqs} />
              )}
            </div>

            {/* ── Right Column Sticky Sidebar (32%) ── */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-16">
              {/* Interactive Table of Contents */}
              {headings.length > 1 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ListTree className="w-4 h-4 text-brand-600" />
                    <span>Table of Contents</span>
                  </h3>
                  <ul className="space-y-2.5 text-xs pt-1">
                    {headings.map((h, i) => (
                      <li key={i}>
                        <a
                          href={`#${h.anchorId}`}
                          className="text-slate-700 hover:text-brand-600 font-medium flex items-start gap-2 transition-colors group"
                        >
                          <span className="text-brand-600 font-black shrink-0">{i + 1}.</span>
                          <span className="leading-snug group-hover:underline">{h.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Free AI Career Tools Widget */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Free Visa &amp; ATS Tools</span>
                </h3>
                <div className="space-y-2.5 pt-1">
                  <Link
                    href="/tools/cv-job-match"
                    className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-50/60 border border-slate-200/80 hover:border-brand-300 transition-all group"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-brand-600 flex items-center justify-between">
                      <span>🎯 CV Job Match</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Match 690+ verified sponsor jobs automatically</div>
                  </Link>

                  <Link
                    href="/tools/ats-checker"
                    className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-50/60 border border-slate-200/80 hover:border-brand-300 transition-all group"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-brand-600 flex items-center justify-between">
                      <span>📄 ATS Resume Scanner</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Audit formatting and keyword density for 90%+ pass rate</div>
                  </Link>
                </div>
              </div>

              {/* Related Visa & Career Guides */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    <span>Related Visa Guides</span>
                  </h3>
                  <div className="space-y-3 pt-1">
                    {relatedPosts.map((r) => (
                      <Link
                        key={r.id}
                        href={`/blog/${r.slug}`}
                        className="block group"
                      >
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                          {r.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                          {r.readTimeMinutes} min read
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Sponsorship Alerts Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 space-y-3.5 shadow-xl border border-slate-700">
                <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stay Ahead of Deadlines</span>
                </div>
                <h4 className="text-sm font-black text-white">
                  Get Verified Visa Sponsorship Alerts
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join 14,000+ international professionals receiving weekly verified vacancies directly in their inbox.
                </p>
                <Link
                  href="/jobs"
                  className="block w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-center rounded-xl text-xs font-black transition-colors shadow-md"
                >
                  Subscribe for Free
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
