const DEFAULT_SITE_URL = "https://truyenviethay.id.vn";
const DEFAULT_OG_IMAGE = `${DEFAULT_SITE_URL}/favicon-96x96.png`;

const TRACKING_PARAM_PREFIXES = ["utm_", "fbclid", "gclid"];

export const siteUrl = resolveSiteUrl();
export const defaultOgImage = DEFAULT_OG_IMAGE;

function resolveSiteUrl() {
  const envValue = import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL;
  return envValue.replace(/\/+$/, "");
}

export function normalizePath(path = "/") {
  if (!path) return "/";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

export function toCanonicalUrl(pathOrUrl: string) {
  if (!pathOrUrl) return siteUrl;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${siteUrl}${normalizePath(pathOrUrl)}`;
}

export function toCanonicalUrlWithQuery(
  path: string,
  query: Record<string, string | number | Array<string | number>> = {},
) {
  const canonicalBase = toCanonicalUrl(path);
  const params = new URLSearchParams();

  Object.keys(query)
    .sort()
    .forEach((key) => {
      const value = query[key];
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
        return;
      }
      if (value === "" || value === null || value === undefined) return;
      params.set(key, String(value));
    });

  const queryString = params.toString();
  return queryString ? `${canonicalBase}?${queryString}` : canonicalBase;
}

export function stripHtml(input?: string | null) {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(input: string, maxLength = 160) {
  if (!input) return "";
  if (input.length <= maxLength) return input;
  return `${input.slice(0, maxLength - 3).trim()}...`;
}

export function sanitizeRouteQuery(query: Record<string, unknown>) {
  const sanitized: Record<string, string | string[]> = {};

  Object.entries(query).forEach(([key, value]) => {
    if (!value) return;

    const keyLower = key.toLowerCase();
    if (TRACKING_PARAM_PREFIXES.some((prefix) => keyLower.startsWith(prefix))) {
      return;
    }

    if (Array.isArray(value)) {
      const normalized = value.map((item) => String(item)).filter(Boolean);
      if (normalized.length) sanitized[key] = normalized;
      return;
    }

    sanitized[key] = String(value);
  });

  return sanitized;
}

export function getFirstQueryValue(queryValue: unknown): string {
  if (Array.isArray(queryValue)) return String(queryValue[0] || "");
  if (queryValue == null) return "";
  return String(queryValue);
}

export function toPositiveInteger(value: unknown, fallback = 1) {
  const parsed = Number.parseInt(getFirstQueryValue(value), 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}
