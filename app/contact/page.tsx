"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, Send, CheckCircle2, MapPin, Phone, Clock, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Contact Support & Headquarters</h1>
          <p className="text-slate-600 text-sm mt-2 max-w-xl mx-auto">
            Have questions about your subscription, need candidate assistance, or have employer inquiries? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Corporate Office
              </h2>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 text-brand-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">USA Office Address</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">SponsorAJobs Inc.</div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    500 Delaware Ave, Suite 100<br />
                    Wilmington, DE 19801<br />
                    United States
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Support Phone</div>
                  <a href="tel:+13024673188" className="text-sm font-bold text-slate-900 hover:text-brand-600 mt-0.5 block">
                    +1 (302) 467-3188
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mon – Fri: 9:00 AM – 6:00 PM EST</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Email Inquiries</div>
                  <a href="mailto:support@sponsorajobs.com" className="text-sm font-bold text-brand-600 hover:underline mt-0.5 block">
                    support@sponsorajobs.com
                  </a>
                  <a href="mailto:legal@sponsorajobs.com" className="text-xs text-slate-600 hover:underline block mt-0.5">
                    legal@sponsorajobs.com
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified 24-Hour SLA Response Time</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                <h2 className="text-2xl font-black text-slate-900">Message Received!</h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out to SponsorAJobs. An account specialist will review your message and reply to your email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 mb-2">Send Us a Direct Message</h2>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Subscription Inquiry / Data Correction / General Feedback"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide details about your query..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
