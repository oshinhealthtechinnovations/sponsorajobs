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
  LogIn,
  ArrowRight,
  Home,
  User,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { JobAlertModal } from "./JobAlertModal";
import { AuthGateModal } from "./AuthGateModal";

// Primary navigation — Includes explicit Home + Jobs-First items
const NAV_LINKS = [
  { href: "/",          label: "Home",             icon: Home },
  { href: "/jobs",      label: "Find Jobs",        icon: Search },
  { href: "/dashboard", label: "My Applications",  icon: Briefcase },
  { href: "/companies", label: "Companies",         icon: Briefcase },
  { href: "/countries", label: "Countries",         icon: Globe },
  { href: "/blog",      label: "Career Guides",     icon: Compass },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [user, setUser] = useState<any | null>(null);

  const checkUserSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("sa_user", JSON.stringify(data.user));
      } else {
        const stored = localStorage.getItem("sa_user");
        setUser(stored ? JSON.parse(stored) : null);
      }
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setSavedCount(Array.isArray(saved) ? saved.length : 0);
    } catch {
      const stored = localStorage.getItem("sa_user");
      setUser(stored ? JSON.parse(stored) : null);
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

  const openAuth = (defaultTab: "register" | "trial" | "login" = "login") => {
    window.dispatchEvent(new CustomEvent("open-auth-gate", { detail: { defaultTab } }));
  };

  return (
    <>
      <header
        className={`w-full sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? "bg-white/96 backdrop-blur-xl border-b border-slate-200 shadow-sm"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* ── Brand Logo (Clickable Home Link) ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0 cursor-pointer select-none"
            aria-label="SponsorAJobs Homepage"
          >
            <div className="w-8 h-8 rounded-xl bg-[#071522] text-white flex items-center justify-center font-black text-xs tracking-wider shadow-sm group-hover:bg-[#19CBE0] group-hover:text-[#071522] transition-colors shrink-0">
              <span>SA</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-display group-hover:text-[#087F8C] transition-colors">
                SponsorAJobs
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#19CBE0] ml-0.5 mb-0.5" />
            </div>
          </Link>

          {/* ── Desktop Primary Navigation ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "text-[#071522] bg-slate-100 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Action Controls ── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Saved Jobs */}
            <Link
              href="/saved-jobs"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              title="Saved Jobs"
            >
              <Bookmark className="w-4.5 h-4.5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#19CBE0] text-[#071522] text-[9px] font-extrabold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Job Alerts */}
            <button
              onClick={() => setAlertModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-[#F5B942]" />
              <span>Job Alerts</span>
            </button>

            {/* Candidate Auth Session / Sign In Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors text-xs font-bold border border-slate-200"
                  title="Candidate Dashboard & Applications"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#071522] text-white flex items-center justify-center text-[11px] font-black">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "CA"}
                  </div>
                  <span className="max-w-[110px] truncate hidden md:inline">{user.name?.split(" ")[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer hidden md:flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuth("login")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#087F8C]" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => openAuth("register")}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#087F8C]/10 text-[#087F8C] hover:bg-[#087F8C]/20 border border-[#087F8C]/20 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#087F8C]" />
                  <span>Join Free</span>
                </button>
              </div>
            )}

            {/* Primary CTA: Search Jobs */}
            <Link
              href="/jobs"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071522] hover:bg-slate-800 text-white text-sm font-bold transition-colors shadow-sm cursor-pointer"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#19CBE0]" />
            </Link>

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
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
            {/* User status card on mobile */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#071522] text-white flex items-center justify-center text-xs font-black shrink-0">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "CA"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth("login");
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#087F8C]" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth("register");
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#087F8C] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            <nav className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#071522] bg-slate-100 font-bold"
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
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAlertModalOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm flex items-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[#F5B942]" />
                <span>Job Alerts</span>
              </button>

              <Link
                href="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-[#071522] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4 text-[#19CBE0]" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <JobAlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} />
      <AuthGateModal />
    </>
  );
};
