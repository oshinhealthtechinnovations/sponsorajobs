"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import {
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Tag,
  Plus,
  RefreshCw,
  Send,
  Sliders,
} from "lucide-react";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Generator form state
  const [genCountry, setGenCountry] = useState("GB");
  const [genCategory, setGenCategory] = useState("information-technology");
  const [genTopic, setGenTopic] = useState("salary_guide");

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog?q=${encodeURIComponent(search)}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [search]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          countryCode: genCountry,
          categorySlug: genCategory,
          topicType: genTopic,
        }),
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`✅ Generated: "${data.post.title}"`);
        loadPosts();
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to generate post"}`);
      }
    } catch (err: any) {
      setMessage(`❌ Network error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_publish",
          postId,
          isPublished: !currentStatus,
        }),
      });
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SEO Publishing Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Blog & Authority Guide Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated keyword targeting, article publishing, and Google structured data index management.
          </p>
        </div>

        <Link
          href="/blog"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shrink-0"
        >
          <span>View Public Blog</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
        </Link>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-slate-800 border border-brand-500/40 text-xs text-white font-medium flex items-center justify-between">
          <span>{message}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 1-Click Programmatic Post Generator Card ── */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-brand-400">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Programmatic SEO Article Generator
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Automatically synthesize a comprehensive 100/100 SEO score guide with targeted keywords, live job listings widget, FAQs, and JSON-LD schema.
        </p>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Country
            </label>
            <select
              value={genCountry}
              onChange={(e) => setGenCountry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
            >
              {INITIAL_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Industry
            </label>
            <select
              value={genCategory}
              onChange={(e) => setGenCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
            >
              {INITIAL_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Topic Blueprint
            </label>
            <select
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="salary_guide">Salary & Visa Threshold Guide</option>
              <option value="hiring_trends">Sponsor Hiring Trends</option>
              <option value="visa_shortcuts">Visa Process & CoS Blueprint</option>
              <option value="top_employers">Top Sponsoring Employers List</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{generating ? "Generating Guide..." : "Generate SEO Guide"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          onClick={loadPosts}
          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* ── Articles Table ── */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Article Title & Slug</th>
                <th className="p-4">Category</th>
                <th className="p-4">Target Country</th>
                <th className="p-4">Read Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 max-w-sm">
                    <p className="font-bold text-white line-clamp-1">{post.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                      /blog/{post.slug}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 text-[10px] font-bold border border-brand-500/20">
                      {post.category.name}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">
                    {post.countryCode || "GLOBAL"}
                  </td>
                  <td className="p-4 text-slate-400">
                    {post.readTimeMinutes} min
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTogglePublish(post.id, post.isPublished)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        post.isPublished
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                      }`}
                    >
                      {post.isPublished ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-amber-400" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-bold hover:underline"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
