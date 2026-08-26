import React from "react";
import Link from "next/link";
import { Sparkles, Info, CheckCircle2 } from "lucide-react";

/**
 * Parse inline markdown tokens:
 * - **bold**
 * - *italic*
 * - [link text](url)
 * - `code`
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex matches: **bold** OR *italic* OR [link](url) OR `code`
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={`bold-${match.index}`} className="font-bold text-slate-900">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={`italic-${match.index}`} className="italic text-slate-800">
          {match[3]}
        </em>
      );
    } else if (match[4] && match[5]) {
      // [text](url)
      const linkText = match[4];
      const href = match[5];
      const isInternal = href.startsWith("/");

      if (isInternal) {
        parts.push(
          <Link
            key={`link-${match.index}`}
            href={href}
            className="text-brand-600 font-semibold hover:text-brand-700 underline decoration-brand-300 hover:decoration-brand-600 transition-colors"
          >
            {linkText}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 font-semibold hover:text-brand-700 underline decoration-brand-300 hover:decoration-brand-600 transition-colors"
          >
            {linkText}
          </a>
        );
      }
    } else if (match[6]) {
      // `code`
      parts.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-mono border border-slate-200"
        >
          {match[6]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];

  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const isOrdered = currentList.type === "ol";
    const items = currentList.items;
    currentList = null;

    elements.push(
      isOrdered ? (
        <ol key={`list-${elements.length}`} className="my-4 space-y-2 pl-6 list-decimal text-slate-700">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm sm:text-base leading-relaxed pl-1">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      ) : (
        <ul key={`list-${elements.length}`} className="my-4 space-y-2 pl-6 list-disc text-slate-700 marker:text-brand-500">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm sm:text-base leading-relaxed pl-1">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      )
    );
  };

  const flushTable = () => {
    if (!currentTable) return;
    const { headers, rows } = currentTable;
    currentTable = null;

    elements.push(
      <div key={`table-${elements.length}`} className="my-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
        <table className="w-full text-left text-sm text-slate-700 border-collapse">
          {headers.length > 0 && (
            <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="py-3 px-4">
                    {parseInlineMarkdown(h.trim())}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((r, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 1 ? "bg-slate-50/50" : ""}>
                {r.map((cell, cellIdx) => (
                  <td key={cellIdx} className="py-3 px-4 text-xs sm:text-sm">
                    {parseInlineMarkdown(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Table Row Detection
    if (line.startsWith("|") && line.endsWith("|")) {
      flushList();
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // Check if it's separator row |---|---|
      if (cells.every((c) => /^-+$/.test(c))) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Unordered list item (* or -)
    if (/^(\*|-)\s+/.test(line)) {
      const text = line.replace(/^(\*|-)\s+/, "");
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [text] };
      } else {
        currentList.items.push(text);
      }
      continue;
    }

    // Ordered list item (1. )
    if (/^\d+\.\s+/.test(line)) {
      const text = line.replace(/^\d+\.\s+/, "");
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [text] };
      } else {
        currentList.items.push(text);
      }
      continue;
    }

    flushList();

    // Headings
    if (line.startsWith("# ")) {
      const text = line.replace("# ", "");
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl sm:text-4xl font-black font-display text-slate-900 mt-6 mb-4">
          {parseInlineMarkdown(text)}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      const text = line.replace("## ", "");
      const anchorId = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      elements.push(
        <h2
          key={`h2-${i}`}
          id={anchorId}
          className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-10 mb-4 border-b border-slate-100 pb-2.5 flex items-center gap-2 scroll-mt-24"
        >
          <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
          <span>{parseInlineMarkdown(text)}</span>
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      const text = line.replace("### ", "");
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-bold font-display text-slate-900 mt-6 mb-2">
          {parseInlineMarkdown(text)}
        </h3>
      );
      continue;
    }

    // Callout / Blockquote
    if (line.startsWith("> ")) {
      const text = line.replace("> ", "");
      elements.push(
        <div
          key={`callout-${i}`}
          className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-50 to-sky-50 border-l-4 border-brand-600 text-brand-950 text-sm sm:text-base leading-relaxed flex items-start gap-3 shadow-2xs"
        >
          <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{parseInlineMarkdown(text)}</div>
        </div>
      );
      continue;
    }

    // Horizontal Rule
    if (line === "---" || line === "***") {
      elements.push(<hr key={`hr-${i}`} className="my-8 border-slate-200" />);
      continue;
    }

    // Empty line
    if (!line) {
      continue;
    }

    // Standard Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm sm:text-base text-slate-700 leading-relaxed my-3">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  flushList();
  flushTable();

  return <div className="space-y-1">{elements}</div>;
};
