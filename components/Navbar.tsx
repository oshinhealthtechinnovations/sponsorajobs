"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Menu, X, Globe, Briefcase, HelpCircle,
  Bell, FileText, Sparkles, Compass, Shield, ArrowUpRight,
} from "lucide-react";
import { JobAlertModal } from "./JobAlertModal";

// Streamlined, ultra-clean primary desktop navigation
const navLinks = [
  { href: "/jobs", label: "Find Jobs", icon: Search },
  { href: "/tools/ats-checker", label: "ATS Resume Checker", icon: FileText, badge: "AI" },
  { href: "/companies", label: "Companies", icon: Briefcase },
  { href: "/blog", label: "Visa Guides", icon: Compass },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  const checkUserSession = () => {
    try {
      const stored = localStorage.getItem("sa_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUserSession();
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("user-session-changed", checkUserSession);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("user-session-changed", checkUserSession);
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
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            : "bg-white/95 backdrop-blur-md border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* ── Minimalist Modern Brand Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-xs tracking-wider shadow-sm group-hover:bg-brand-600 transition-colors duration-200">
              <span>SA</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-base font-extrabold tracking-tight text-slate-900 font-display">
                SponsorAJobs
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 ml-0.5"></span>
            </div>
          </Link>

          {/* ── Modern Understated Desktop Navigation ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "text-slate-950 bg-slate-100/90 font-bold"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-200/60 leading-none">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Elegant Right Action Suite ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Job Alerts Ghost Trigger */}
            <button
              type="button"
              onClick={() => setAlertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 text-xs font-medium transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Job Alerts</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block mx-0.5" />

            {/* User Account / Sign In CTA */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 text-xs">
                <span className="font-semibold text-slate-800 hidden sm:inline truncate max-w-[120px]">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 font-medium text-xs hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-auth-gate", {
                      detail: { defaultTab: "register" },
                    })
                  );
                }}
                className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-950 text-xs font-medium hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <span>Sign In</span>
              </button>
            )}

            {/* Premium Primary CTA */}
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 active:scale-[0.98] text-white text-xs font-semibold shadow-xs hover:shadow transition-all duration-150"
            >
              <Search className="w-3.5 h-3.5 opacity-80" />
              <span>Explore Jobs</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Clean Mobile Menu Drawer ── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeInDown shadow-lg">
            <div className="space-y-1 pb-3 border-b border-slate-100">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "text-slate-950 bg-slate-100 font-bold"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-200/60">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAlertModalOpen(true);
                }}
                className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>Set Up Job Alerts</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <JobAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </>
  );
};
