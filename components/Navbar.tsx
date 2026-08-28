"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Globe,
  Briefcase,
  Bell,
  Compass,
  Bookmark,
  ShieldCheck,
  ArrowRight,
  LogIn,
  User as UserIcon,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { JobAlertModal } from "./JobAlertModal";

// Primary navigation links conforming to tier-1 specification
const NAV_LINKS = [
  { href: "/jobs", label: "Jobs", icon: Search },
  { href: "/countries", label: "Countries", icon: Globe },
  { href: "/companies", label: "Employers", icon: Briefcase },
  { href: "/visa-sponsorship", label: "Visa Intelligence", icon: ShieldCheck },
  { href: "/blog", label: "Career Guides", icon: Compass },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [user, setUser] = useState<any | null>(null);

  const checkUserSession = () => {
    try {
      const stored = localStorage.getItem("sa_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setSavedCount(Array.isArray(saved) ? saved.length : 0);
    } catch {
      setUser(null);
      setSavedCount(0);
    }
  };

  useEffect(() => {
    checkUserSession();
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("user-session-changed", checkUserSession);
    window.addEventListener("storage", checkUserSession);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("user-session-changed", checkUserSession);
      window.removeEventListener("storage", checkUserSession);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("sa_user");
      setUser(null);
      window.dispatchEvent(new Event("user-session-changed"));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header
        className={`w-full sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* ── Brand Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-xs tracking-wider shadow-sm group-hover:bg-brand-600 transition-colors shrink-0">
              <span>SA</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-display">
                SponsorAJobs
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 ml-0.5"></span>
            </div>
          </Link>

          {/* ── Desktop Primary Navigation Links ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "text-brand-600 bg-brand-50/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Right Action Controls ── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Saved Jobs Link */}
            <Link
              href="/saved-jobs"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
              title="Saved Jobs"
            >
              <div className="relative">
                <Bookmark className="w-4 h-4 text-slate-600" />
                {savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Saved</span>
            </Link>

            {/* Job Alert Button */}
            <button
              onClick={() => setAlertModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Create Job Alert</span>
              <span className="sm:hidden">Alerts</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
            <nav className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname?.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-colors ${
                      isActive
                        ? "text-brand-600 bg-brand-50 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/saved-jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Saved Jobs</span>
                </div>
                {savedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                    {savedCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAlertModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/25"
              >
                <Bell className="w-4 h-4 text-amber-300" />
                <span>Create Instant Job Alert</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <JobAlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} />
    </>
  );
};
