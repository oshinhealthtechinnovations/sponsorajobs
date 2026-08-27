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
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Briefcase,
  ExternalLink,
  BookOpen,
  ListTree,
  ShieldCheck,
  Tag,
  Wand2,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // Extract Table of Contents from headings
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

  // Query live jobs if embed query is present
  const jobRepo = new JobRepository();
  let liveJobs: any[] = [];
  try {
    if (post.jobEmbedQuery) {
      const { countryCode, categorySlug, q, limit = 3 } = post.jobEmbedQuery;
      const res = await jobRepo.search({
        country: countryCode,
        category: categorySlug,
        q,
        limit,
        sort: "sponsorship",
      });
      liveJobs = res.jobs;
    }
  } catch (err) {
    liveJobs = [];
  }

  // Schema objects
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
        {/* ── Premium Editorial Article Header ── */}
        <header className="bg-white border-b border-slate-200/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-brand-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/blog" className="hover:text-brand-600 transition-colors">
                Guides & Intelligence
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold">{post.category.name}</span>
            </nav>

            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 uppercase tracking-wider">
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

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-slate-900 tracking-tight leading-[1.2]">
              {post.title}
            </h1>

            {/* Subtitle / Excerpt */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>

            {/* Author & Verification Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold tracking-wider">
                  {post.author.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{post.author.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Link
                  href="/tools/cv-job-match"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-sm"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Match My CV for This Role</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Article 2-Column Layout ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Main Article Column ── */}
            <div className="lg:col-span-8 space-y-8">
              {/* Key Takeaways Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-700 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-brand-400 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Key Intelligence Summary</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Essential Takeaways from this Guide:
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>All criteria reflect updated {new Date().getFullYear()} immigration regulations and verified employer sponsorship thresholds.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Apply directly to accredited sponsor employers to bypass unverified third-party recruiters.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Match your technical skills against standard SOC occupational taxonomy codes before applying.</span>
                  </li>
                </ul>
              </div>

              {/* Markdown Content Article Body */}
              <article className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm leading-relaxed text-slate-800">
                <MarkdownContent content={post.content} />
              </article>

              {/* Interactive In-Article CTA */}
              <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Compatibility Check</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  Want to Know If Your CV Qualifies for These Roles?
                </h3>
                <p className="text-white/80 text-xs sm:text-sm max-w-xl">
                  Upload your CV to run our deterministic matching engine against 650+ verified sponsor jobs. Get an instant score and personalized skill gap breakdown.
                </p>
                <div className="pt-2">
                  <Link
                    href="/tools/cv-job-match"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5"
                  >
                    <span>Run Free CV Match Scan</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Related Search Keywords */}
              {post.targetKeywords && post.targetKeywords.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 flex items-center gap-1 mr-2">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Topics:</span>
                  </span>
                  {post.targetKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Live Matching Jobs Widget */}
              {liveJobs.length > 0 && (
                <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                        Live Matching Database
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {post.jobEmbedQuery?.title || "Active Sponsor Jobs In This Sector"}
                      </h3>
                    </div>
                    <Link
                      href="/jobs"
                      className="text-xs font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>View All</span>
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

              {/* FAQ Section */}
              {post.faqs && post.faqs.length > 0 && (
                <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <HelpCircle className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold">Frequently Asked Questions</h3>
                  </div>

                  <div className="space-y-3">
                    {post.faqs.map((faq, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                        <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── Right Column Sticky Sidebar ── */}
            <aside className="lg:col-span-4 space-y-6 sticky top-20">
              {/* Table of Contents */}
              {headings.length > 1 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                    <ListTree className="w-4 h-4 text-brand-600" />
                    <span>Table of Contents</span>
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {headings.map((h, i) => (
                      <li key={i}>
                        <a
                          href={`#${h.anchorId}`}
                          className="text-slate-700 hover:text-brand-600 font-medium flex items-start gap-2 transition-colors"
                        >
                          <span className="text-brand-600 font-bold shrink-0">{i + 1}.</span>
                          <span className="leading-snug">{h.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick AI Tools Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Free Visa & ATS Tools</span>
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/tools/cv-job-match"
                    className="block p-3 rounded-xl bg-slate-50 hover:bg-brand-50/50 border border-slate-100 hover:border-brand-200 transition-colors"
                  >
                    <div className="font-bold text-xs text-slate-900">🎯 CV Job Match</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Find jobs matching your CV skills & visa status</div>
                  </Link>
                  <Link
                    href="/tools/ats-checker"
                    className="block p-3 rounded-xl bg-slate-50 hover:bg-brand-50/50 border border-slate-100 hover:border-brand-200 transition-colors"
                  >
                    <div className="font-bold text-xs text-slate-900">📄 ATS Resume Checker</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Audit your CV for international sponsorship</div>
                  </Link>
                </div>
              </div>

              {/* Related Guides Card */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    <span>Related Guides</span>
                  </h3>
                  <div className="space-y-2.5">
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

              {/* Newsletter / Alert Subscription */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
                <div className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Stay Updated
                </div>
                <h4 className="text-sm font-bold text-white">
                  Get Visa Sponsorship Job Alerts
                </h4>
                <p className="text-xs text-slate-300">
                  Receive weekly verified sponsorship vacancies directly in your inbox.
                </p>
                <Link
                  href="/jobs"
                  className="block w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-center rounded-lg text-xs font-bold transition-colors"
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
