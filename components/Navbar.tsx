"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Menu, X, Globe, Briefcase, Building2, HelpCircle,
  Bell, BookOpen, ArrowRight,
} from "lucide-react";
import { JobAlertModal } from "./JobAlertModal";

// Streamlined, clean primary desktop links to prevent crowding
const navLinks = [
  { href: "/jobs",       label: "Find Jobs",     icon: Search },
  { href: "/countries",  label: "Countries",     icon: Globe },
  { href: "/companies",  label: "Top Sponsors",  icon: Building2 },
  { href: "/blog",       label: "Visa Guides",   icon: BookOpen },
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
    const handleScroll = () => setScrolled(window.scrollY > 12);
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
        className={`w-full sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-xs border-b border-slate-200/80"
            : "bg-white/90 backdrop-blur-md border-b border-slate-200/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* ── Brand Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-brand-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-brand-600 to-brand-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-sm tracking-tight font-display">SA</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
              Sponsor<span className="gradient-text-brand">A</span>Jobs
            </span>
          </Link>

          {/* ── Streamlined Desktop Navigation ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-brand-600 bg-brand-50 shadow-2xs"
                      : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Clean Right CTAs ── */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Job Alerts Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new Event("open-subscriber-popup"));
                setAlertModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-200/90 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span className="hidden sm:inline">Job Alerts</span>
            </button>

            {/* User Account / Sign In CTA */}
            {user ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <span className="px-2.5 py-1 font-bold text-slate-800 hidden sm:inline truncate max-w-[120px]">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-[11px] border border-slate-200 transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
              >
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Direct Search / Browse CTA */}
            <Link
              href="/jobs"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-brand-sm hover:shadow-brand transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore Jobs</span>
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Responsive Mobile Menu Drawer ── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-fadeInDown shadow-lg">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "text-brand-600 bg-brand-50 border border-brand-200"
                        : "text-slate-700 hover:text-brand-600 bg-slate-50 border border-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-brand-600 flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Categories</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-brand-600 flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>About Us</span>
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAlertModalOpen(true);
                }}
                className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Set Up Daily Job Alerts</span>
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
