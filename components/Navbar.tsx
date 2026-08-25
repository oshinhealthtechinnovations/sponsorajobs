"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Globe, Briefcase, Building2, HelpCircle } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/jobs", label: "Search Jobs", icon: Briefcase },
    { href: "/countries", label: "Countries", icon: Globe },
    { href: "/categories", label: "Categories", icon: Briefcase },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/visa-sponsorship", label: "Visa Guide", icon: HelpCircle },
    { href: "/about", label: "About", icon: null },
  ];

  return (
    <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 group-hover:bg-brand-700 text-white flex items-center justify-center font-black text-base shadow-sm transition-all">
            SA
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Sponsor<span className="text-brand-600">A</span>Jobs
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-brand-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Search Jobs</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold"
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
