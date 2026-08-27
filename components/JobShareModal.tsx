"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  Linkedin,
  MessageCircle,
  Send,
  Twitter,
  Mail,
  Sparkles,
  Globe,
} from "lucide-react";

interface JobShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  countryCode?: string;
  slug?: string;
  shareUrl?: string;
}

export const JobShareModal: React.FC<JobShareModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  countryCode,
  slug,
  shareUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const url =
    shareUrl ||
    (typeof window !== "undefined"
      ? slug
        ? `${window.location.origin}/job/${slug}`
        : window.location.href
      : "");

  const shareText = `Check out this verified visa sponsorship opportunity: ${jobTitle} at ${companyName} on SponsorAJobs!`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${jobTitle} at ${companyName}`,
          text: shareText,
          url,
        });
        onClose();
      } catch {
        // User cancelled
      }
    }
  };

  const shareLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      bg: "bg-[#0A66C2] hover:bg-[#084e96] text-white",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      bg: "bg-[#25D366] hover:bg-[#1ebd59] text-white",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${url}`)}`,
    },
    {
      name: "Telegram",
      icon: Send,
      bg: "bg-[#229ED9] hover:bg-[#1a80b0] text-white",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      bg: "bg-slate-900 hover:bg-black text-white",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "Email",
      icon: Mail,
      bg: "bg-slate-600 hover:bg-slate-700 text-white",
      href: `mailto:?subject=${encodeURIComponent(`Visa Sponsorship Job: ${jobTitle} at ${companyName}`)}&body=${encodeURIComponent(`${shareText}\n\nApply here: ${url}`)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Share This Opportunity
            </h3>
            <p className="text-xs text-slate-500">
              Help your network find verified visa sponsorship roles
            </p>
          </div>
        </div>

        {/* Job Snippet Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
          <h4 className="text-sm font-bold text-slate-900 truncate">
            {jobTitle}
          </h4>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {companyName} {countryCode ? `· ${countryCode.toUpperCase()}` : ""}
          </p>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-5 gap-2.5 mb-5">
          {shareLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl ${item.bg} transition-all duration-200 active:scale-95 shadow-sm`}
              title={`Share on ${item.name}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.name.split(" ")[0]}</span>
            </a>
          ))}
        </div>

        {/* Copy Link Input Bar */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Or copy direct job link:
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 px-3 py-1.5 text-xs text-slate-700 bg-transparent outline-none truncate font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-brand-600 hover:bg-brand-700 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Native Share Trigger (if supported) */}
        {typeof navigator !== "undefined" && typeof (navigator as any).share === "function" && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>Open System Share Menu</span>
          </button>
        )}
      </div>
    </div>
  );
};
