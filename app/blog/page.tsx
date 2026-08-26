import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { blogRepository } from "@/lib/repositories/blogRepository";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import {
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  Search,
  CheckCircle2,
  Calendar,
  User,
} from "lucide-react";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Visa Sponsorship Guides & Global Career Intelligence | SponsorAJobs Blog",
  description:
    "In-depth guides to UK Skilled Worker visas, USA H-1B cap-exempt jobs, Canada LMIA work permits, Australia TSS 482 visas, and top international sponsor companies.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Visa Sponsorship Guides & Global Career Intelligence | SponsorAJobs",
    description:
      "Expert guides on obtaining work visas in the UK, USA, Australia, Canada, and New Zealand. Updated salary benchmarks, sponsor company lists, and application strategies.",
    type: "website",
    url: "/blog",
  },
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; country?: string };
}) {
  const selectedCategory = searchParams.category;
  const searchQuery = searchParams.q;
  const countryCode = searchParams.country;

  const { posts, total } = await blogRepository.getAllPosts({
    categorySlug: selectedCategory,
    countryCode,
    searchQuery,
    limit: 50,
  });

  const categories = await blogRepository.getCategories();
  const featuredPosts = await blogRepository.getFeaturedPosts(1);
  const heroPost = !selectedCategory && !searchQuery ? featuredPosts[0] : null;
  const gridPosts = heroPost ? posts.filter((p) => p.id !== heroPost.id) : posts;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.15),transparent_50%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>International Career Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
              Visa Sponsorship Guides & <span className="gradient-text-brand">Global Career Insights</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
              Step-by-step roadmaps, verified sponsor company rankings, and updated salary benchmarks to help you land your dream job abroad.
            </p>

            {/* Quick Keyword Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto text-xs">
              <span className="text-slate-400 font-medium mr-1">Popular:</span>
              {[
                { label: "UK Skilled Worker", href: "/blog?category=visa-guides" },
                { label: "USA H-1B Cap-Exempt", href: "/blog?category=us-immigration" },
                { label: "Canada LMIA", href: "/blog?category=canada-work-permits" },
                { label: "Australia TSS 482", href: "/blog?category=australia-visas" },
                { label: "Top Tech Sponsors", href: "/blog?category=company-rankings" },
                { label: "NHS Healthcare", href: "/blog?category=healthcare-careers" },
              ].map((pill) => (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-brand-600/30 text-slate-300 hover:text-white border border-slate-700/60 hover:border-brand-500/40 transition-all"
                >
                  {pill.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Topic Filter Bar ── */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !selectedCategory
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Articles ({total})
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {cat.name} ({cat.count})
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* ── Featured Hero Article (If on All Articles) ── */}
          {heroPost && (
            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-slate-700/60 transition-all hover:border-brand-500/50">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 font-bold border border-brand-400/30">
                      ★ Featured Master Guide
                    </span>
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {heroPost.readTimeMinutes} min read
                    </span>
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(heroPost.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white group-hover:text-brand-300 transition-colors">
                    <Link href={`/blog/${heroPost.slug}`}>{heroPost.title}</Link>
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {heroPost.excerpt}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-brand-600/40 border border-brand-400/30 flex items-center justify-center text-xs font-bold text-brand-200">
                      {heroPost.author.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{heroPost.author.name}</p>
                      <p className="text-[11px] text-slate-400">{heroPost.author.role}</p>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex lg:flex-col items-start lg:items-end justify-between gap-4">
                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-md transition-all group-hover:shadow-brand-500/25"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Articles Grid ── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                {selectedCategory ? `${selectedCategory.replace("-", " ").toUpperCase()} Guides` : "Latest Visa & Career Articles"}
              </h2>
              <span className="text-xs text-slate-500">{gridPosts.length} Guides Available</span>
            </div>

            {gridPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <p className="text-slate-500 text-sm">No articles found in this category yet.</p>
                <Link href="/blog" className="mt-4 inline-block text-xs font-bold text-brand-600 hover:underline">
                  View all articles →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500/40 p-6 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 font-semibold border border-brand-100">
                          {post.category.name}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTimeMinutes} min
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium truncate max-w-[120px]">{post.author.name}</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-bold text-brand-600 group-hover:text-brand-700 flex items-center gap-1"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* ── Internal Hub Links Grid ── */}
          <section className="bg-gradient-to-br from-slate-900 to-brand-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold font-display text-white mb-2">
                Explore Verified Jobs by Country
              </h3>
              <p className="text-slate-300 text-sm mb-6">
                Browse our real-time database of sponsored jobs across top destination countries:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { name: "United Kingdom", flag: "🇬🇧", code: "gb", href: "/jobs/gb" },
                  { name: "United States", flag: "🇺🇸", code: "us", href: "/jobs/us" },
                  { name: "Australia", flag: "🇦🇺", code: "au", href: "/jobs/au" },
                  { name: "Canada", flag: "🇨🇦", code: "ca", href: "/jobs/ca" },
                  { name: "New Zealand", flag: "🇳🇿", code: "nz", href: "/jobs/nz" },
                ].map((country) => (
                  <Link
                    key={country.code}
                    href={country.href}
                    className="p-3 rounded-xl bg-white/10 hover:bg-brand-600/40 border border-white/10 hover:border-brand-400/40 text-center transition-all group"
                  >
                    <span className="text-2xl block mb-1">{country.flag}</span>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                      {country.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── Newsletter / Job Alert Signup ── */}
          <JobAlertSignup />
        </div>
      </main>

      <Footer />
    </div>
  );
}
