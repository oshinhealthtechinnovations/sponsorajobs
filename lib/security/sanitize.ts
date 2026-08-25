/**
 * Input sanitization and XSS protection utilities
 * Reference: Section 55 & 111
 */

/**
 * Sanitize raw HTML text to prevent stored XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe, embed, object tags
    .replace(/<(iframe|embed|object|base|meta|link)[^>]*>/gi, "")
    // Remove inline event handlers like onclick, onload, onerror
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/on\w+=\w+/gi, "")
    // Remove javascript: URLs in href/src
    .replace(/href=["']?javascript:[^"'>]*/gi, 'href="#"')
    .replace(/src=["']?javascript:[^"'>]*/gi, "");
}

/**
 * Sanitize search keywords to prevent query manipulation
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== "string") return "";

  return query
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove ASCII control characters
    .replace(/[%_\\]/g, "") // Remove SQL LIKE wildcards from literal terms
    .trim()
    .slice(0, 100); // Enforce max 100 character query length
}
