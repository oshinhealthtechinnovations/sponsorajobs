"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Globe,
  Briefcase,
  Bell,
  Bookmark,
  LogIn,
  LogOut,
  Sparkles,
  ArrowRightLeft,
  Award,
  FileText,
  ChevronDown,
  Wrench,
} from "lucide-react";
import { JobAlertModal } from "./JobAlertModal";
import { AuthGateModal } from "./AuthGateModal";

// Primary clean navigation links
const PRIMARY_NAV_LINKS = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/countries", label: "Countries" },
];

// Rich tools dropdown menu
const TOOLS_NAV_ITEMS = [
  {
    href: "/tools/smart-job-finder",
    label: "AI Smart Match",
    description: "Natural language visa job recommendation engine",
    icon: Sparkles,
    badge: "AI",
  },
  {
    href: "/tools/cv-cover-letter",
    label: "CV & Visa Cover Letter",
    description: "Sponsorship pitch letters & bullet optimizer",
    icon: FileText,
    badge: "New",
  },
  {
    href: "/tools/salary-converter",
    label: "Salary Converter",
    description: "Real-time ECB currency & take-home calculations",
    icon: ArrowRightLeft,
  },
  {
    href: "/tools/visa-points-calculator",
    label: "Visa Points Calculator",
    description: "UK 70-pts & Australia 65-pts points assessment",
    icon: Award,
  },
  {
    href: "/tools/ats-checker",
    label: "ATS Resume Scanner",
    description: "Scan your resume against any job description",
    icon: Search,
  },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [user, setUser] = useState<any | null>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

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

  // Close tools dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

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

  const openAuth = (defaultTab: "register" | "login" = "login") => {
    window.dispatchEvent(new CustomEvent("open-auth-gate", { detail: { defaultTab } }));
  };

  return (
    <>
      <header
        className={`w-full sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? "bg-white/96 backdrop-blur-xl border-b border-slate-200 shadow-xs"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* ── Brand Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0 cursor-pointer select-none"
            aria-label="SponsorAJobs Homepage"
          >
            <div className="w-8 h-8 rounded-xl bg-[#071522] text-white flex items-center justify-center font-black text-xs tracking-wider shadow-xs group-hover:bg-[#19CBE0] group-hover:text-[#071522] transition-colors shrink-0">
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
          <nav className="hidden md:flex items-center gap-1">
            {PRIMARY_NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "text-[#071522] bg-slate-100 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Tools Dropdown Menu */}
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  pathname?.startsWith("/tools")
                    ? "text-[#071522] bg-slate-100 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                aria-expanded={toolsDropdownOpen}
              >
                <span>Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    toolsDropdownOpen ? "rotate-180 text-brand-600" : "text-slate-400"
                  }`}
                />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span>Candidate Intelligence Tools</span>
                    <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      100% Free
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {TOOLS_NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-start gap-3 p-2 rounded-xl transition-colors group ${
                            isItemActive ? "bg-brand-50/70" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
                  <span className="max-w-[110px] truncate hidden md:inline">
                    {user.name?.split(" ")[0]}
                  </span>
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
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#087F8C] text-white hover:bg-[#076f7a] text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Free</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
            {/* User status card on mobile */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#071522] text-white flex items-center justify-center text-xs font-black shrink-0">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "CA"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
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

            {/* Primary Nav Links */}
            <nav className="flex flex-col space-y-1">
              {PRIMARY_NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#071522] bg-slate-100 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Candidate Tools Group */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Candidate Free Tools
              </div>
              {TOOLS_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Icon className="w-4 h-4 text-brand-600" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

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
            </div>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <JobAlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} />
      <AuthGateModal />
    </>
  );
};
