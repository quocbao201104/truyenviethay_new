import { buildCanonicalHref, resolveSeoPolicyForRoute } from "../src/seo/routePolicy.js";

const DEFAULT_SITE_URL = "https://truyenviethay.id.vn";
const HEAD_CACHE_CONTROL = "public, max-age=0, s-maxage=300";

function getSingleValue(value, fallback = "") {
  if (Array.isArray(value)) return String(value[0] || fallback);
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveSiteUrl(req) {
  const configured = process.env.VITE_SITE_URL || DEFAULT_SITE_URL;
  const configuredClean = String(configured).trim().replace(/\/+$/, "");
  if (configuredClean) return configuredClean;

  const proto = getSingleValue(req.headers["x-forwarded-proto"], "https");
  const host = getSingleValue(req.headers["x-forwarded-host"] || req.headers.host, "");
  return host ? `${proto}://${host}` : DEFAULT_SITE_URL;
}

function resolveOrigin(req, siteUrl) {
  const explicitOrigin = String(process.env.SEO_RENDER_INDEX_ORIGIN || "").trim().replace(/\/+$/, "");
  if (explicitOrigin) return explicitOrigin;

  const host = getSingleValue(req.headers["x-forwarded-host"] || req.headers.host, "");
  const proto = getSingleValue(req.headers["x-forwarded-proto"], "https");
  return host ? `${proto}://${host}` : siteUrl;
}

function stripInternalQuery(rawQuery = {}) {
  const query = { ...rawQuery };
  delete query.path;
  return query;
}

function stripExistingHeadSignals(html) {
  return html
    .replace(/<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<link[^>]*href=["'][^"']*["'][^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*name=["']robots["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*content=["'][^"']*["'][^>]*name=["']robots["'][^>]*>\s*/gi, "");
}

function injectHeadSignals(html, canonicalHref, robots) {
  const sanitizedHtml = stripExistingHeadSignals(html);
  const canonicalTag = `  <link rel="canonical" href="${escapeHtml(canonicalHref)}" />`;
  const robotsTag = `  <meta name="robots" content="${escapeHtml(robots)}" />`;
  const injection = `\n${canonicalTag}\n${robotsTag}\n`;

  if (sanitizedHtml.includes("</head>")) {
    return sanitizedHtml.replace("</head>", `${injection}</head>`);
  }

  return `${sanitizedHtml}${injection}`;
}

async function fetchIndexHtml(origin) {
  const indexUrl = `${origin}/index.html`;
  const response = await fetch(indexUrl, {
    headers: {
      "x-seo-head-render": "1",
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch index template (${response.status}).`);
  }

  return await response.text();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const requestedPath = getSingleValue(req.query.path, "/");
    const normalizedPath = requestedPath.startsWith("/") ? requestedPath : `/${requestedPath}`;
    const routeQuery = stripInternalQuery(req.query || {});
    const routePolicy = resolveSeoPolicyForRoute({
      pathname: normalizedPath,
      query: routeQuery,
      params: {},
      routeName: "",
    });

    const siteUrl = resolveSiteUrl(req);
    const canonicalHref = buildCanonicalHref(
      siteUrl,
      routePolicy.canonicalPath,
      routePolicy.canonicalQuery,
    );

    const origin = resolveOrigin(req, siteUrl);
    const templateHtml = await fetchIndexHtml(origin);
    const renderedHtml = injectHeadSignals(templateHtml, canonicalHref, routePolicy.robots);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", HEAD_CACHE_CONTROL);
    return res.status(200).send(renderedHtml);
  } catch (error) {
    console.error("seo render error:", error);
    return res.status(500).json({ message: "Unable to render SEO head template." });
  }
}

