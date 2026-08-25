"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Menu, X, Globe, Briefcase, Building2, HelpCircle,
  ChevronDown, MapPin, Sparkles, PlusCircle,
} from "lucide-react";

const navLinks = [
  { href: "/jobs",            label: "Search Jobs",  icon: Search },
  { href: "/countries",       label: "Countries",    icon: Globe },
  { href: "/categories",      label: "Categories",   icon: Briefcase },
  { href: "/companies",       label: "Companies",    icon: Building2 },
  { href: "/visa-sponsorship",label: "Visa Guides",  icon: HelpCircle },
  { href: "/about",           label: "About",        icon: null },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add shadow/bg change on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/80"
          : "bg-white/70 backdrop-blur-md border-b border-slate-200/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── Brand Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-brand-sm">
            {/* Gradient logo background */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-brand-600 to-brand-800" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tight">SA</span>
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
            Sponsor<span className="gradient-text-brand">A</span>Jobs
          </span>
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-brand-600 bg-brand-50"
                    : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right CTAs ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Post a Job — Key revenue/trust signal */}
          <Link
            href="/employers"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-brand-300 bg-white hover:bg-brand-50/50 text-slate-700 hover:text-brand-700 text-xs font-semibold transition-all duration-200 shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post a Job</span>
          </Link>

          {/* Search Jobs CTA */}
          <Link
            href="/jobs"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-brand-sm hover:shadow-brand transition-all duration-200"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Jobs</span>
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

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1 animate-fadeInDown">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-brand-600 bg-brand-50"
                    : "text-slate-700 hover:text-brand-600 hover:bg-slate-50"
                }`}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              href="/employers"
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Job</span>
            </Link>
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold"
            >
              <Search className="w-4 h-4" />
              <span>Search Jobs</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
