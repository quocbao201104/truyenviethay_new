import { buildCanonicalHref, resolveSeoPolicyForRoute } from "../src/seo/routePolicy.js";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

import { getStoryDetail, getChapterDetail, getStoryComments } from "./ssrFetcher.js";

const DEFAULT_SITE_URL = "https://truyenviethay.id.vn";
const HEAD_CACHE_CONTROL = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";
const RENDER_VERSION = "route-head-v3-ssr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

function parseMaybeUrl(rawValue) {
  const input = getSingleValue(rawValue, "").trim();
  if (!input) return null;

  try {
    const parsed = new URL(input, DEFAULT_SITE_URL);
    return parsed;
  } catch (error) {
    return null;
  }
}

function resolveRequestedPath(req) {
  const explicitPath = getSingleValue(req.query?.path, "").trim();
  if (explicitPath) {
    return explicitPath.startsWith("/") ? explicitPath : `/${explicitPath}`;
  }

  const urlCandidates = [
    req.headers?.["x-original-uri"],
    req.headers?.["x-forwarded-uri"],
    req.headers?.["x-rewrite-url"],
    req.headers?.["x-matched-path"],
    req.url,
  ];

  for (const candidate of urlCandidates) {
    const parsed = parseMaybeUrl(candidate);
    if (!parsed) continue;

    if (parsed.searchParams.has("path")) {
      const pathFromQuery = parsed.searchParams.get("path") || "";
      if (pathFromQuery) {
        return pathFromQuery.startsWith("/") ? pathFromQuery : `/${pathFromQuery}`;
      }
    }

    if (parsed.pathname && !parsed.pathname.startsWith("/api/render")) {
      return parsed.pathname;
    }
  }

  return "/";
}

function mergeQueryParams(baseQuery = {}, parsedUrl = null) {
  const merged = { ...stripInternalQuery(baseQuery) };
  if (Object.keys(merged).length > 0) return merged;
  if (!parsedUrl) return merged;

  parsedUrl.searchParams.forEach((value, key) => {
    if (key === "path" || value === "") return;
    if (merged[key] === undefined) {
      merged[key] = value;
      return;
    }
    if (Array.isArray(merged[key])) {
      merged[key].push(value);
      return;
    }
    merged[key] = [merged[key], value];
  });

  return merged;
}

function stripExistingHeadSignals(html) {
  return html
    .replace(/<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<link[^>]*href=["'][^"']*["'][^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*name=["']robots["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*content=["'][^"']*["'][^>]*name=["']robots["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*name=["']x-seo-render["'][^>]*>\s*/gi, "");
}

function injectHeadSignals(html, canonicalHref, robots) {
  const sanitizedHtml = stripExistingHeadSignals(html);
  const canonicalTag = `  <link rel="canonical" href="${escapeHtml(canonicalHref)}" />`;
  const robotsTag = `  <meta name="robots" content="${escapeHtml(robots)}" />`;
  const markerTag = `  <meta name="x-seo-render" content="${RENDER_VERSION}" />`;
  const injection = `\n${canonicalTag}\n${robotsTag}\n${markerTag}\n`;

  if (sanitizedHtml.includes("</head>")) {
    return sanitizedHtml.replace("</head>", `${injection}</head>`);
  }

  return `${sanitizedHtml}${injection}`;
}

function injectSsrContent(html, seoData) {
  if (!seoData) return html;
  
  let result = html;
  // Bơm Title và Description Metadata
  if (seoData.title) {
    if (result.includes("<title>")) {
      result = result.replace(/<title>.*?<\/title>/gi, `<title>${escapeHtml(seoData.title)}</title>`);
    } else if (result.includes("</head>")) {
      result = result.replace("</head>", `  <title>${escapeHtml(seoData.title)}</title>\n</head>`);
    }
  }

  if (seoData.description) {
    const descMeta = `  <meta name="description" content="${escapeHtml(seoData.description)}" />`;
    if (result.includes("</head>")) {
      result = result.replace("</head>", `${descMeta}\n</head>`);
    }
  }

  // Bơm JSON-LD Schema (SEO Structured Data)
  if (seoData.jsonLd) {
    const schemaTag = `\n<script type="application/ld+json">\n${JSON.stringify(seoData.jsonLd, null, 2)}\n</script>\n`;
    if (result.includes("</head>")) {
      result = result.replace("</head>", `${schemaTag}\n</head>`);
    }
  }

  // Bơm sườn Body hiển thị được cho Bot (Crawler đọc)
  if (seoData.bodyHtml) {
    const noscriptContent = `\n<noscript id="seo-ssr-content">\n${seoData.bodyHtml}\n</noscript>\n`;
    if (result.includes("</body>")) {
      result = result.replace("</body>", `${noscriptContent}</body>`);
    } else {
      result += noscriptContent;
    }
  }

  return result;
}

function templateCandidates() {
  return [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html"),
    path.join(__dirname, "..", "dist", "index.html"),
    path.join(__dirname, "..", "index.html"),
  ];
}

async function readIndexTemplateFromFs() {
  const candidates = templateCandidates();
  for (const templatePath of candidates) {
    try {
      return await fs.readFile(templatePath, "utf8");
    } catch (error) {
      continue;
    }
  }
  return "";
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

async function loadIndexTemplate(origin) {
  const fromFs = await readIndexTemplateFromFs();
  if (fromFs) return fromFs;
  return fetchIndexHtml(origin);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const rewrittenUrl = parseMaybeUrl(req.url);
    const requestedPath = resolveRequestedPath(req);
    const normalizedPath = requestedPath.startsWith("/") ? requestedPath : `/${requestedPath}`;
    const routeQuery = mergeQueryParams(req.query || {}, rewrittenUrl);
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
    const templateHtml = await loadIndexTemplate(origin);
    let renderedHtml = templateHtml;
    let renderStatus = "injected";
    let seoData = null;

    try {
      renderedHtml = injectHeadSignals(templateHtml, canonicalHref, routePolicy.robots);

      // Thêm Data SSR Bơm Thẳng Vào HTML
      const storyMatch = normalizedPath.match(/^\/truyen-chu\/([^/]+)$/);
      const chapterMatch = normalizedPath.match(/^\/truyen-chu\/([^/]+)\/([^/]+)$/);

      if (chapterMatch) {
         // TRANG CHỌN CHƯƠNG
         const [_, storySlug, chapterSlug] = chapterMatch;
         const chapter = await getChapterDetail(storySlug, chapterSlug);
         if (chapter) {
             seoData = {
                 title: `${chapter.ten_chuong} - ${chapter.story_name || 'Truyện'} | TruyenVietHay`,
                 description: `Đọc ${chapter.ten_chuong} của truyện ${chapter.story_name || 'Tiên Hiệp'} online mượt mà. Nội dung đầy đủ.`,
                 bodyHtml: `
                   <article>
                      <h1>${escapeHtml(chapter.ten_chuong)}</h1>
                      <div class="chapter-content">
                         ${chapter.noi_dung}
                      </div>
                   </article>
                 `
             };
         }
      } else if (storyMatch) {
         // TRANG CHI TIẾT TRUYỆN
         const [_, storySlug] = storyMatch;
         const story = await getStoryDetail(storySlug);
         if (story) {
             const comments = await getStoryComments(story.id);
             const genresText = (story.genres || []).map(g => escapeHtml(g.ten_theloai || g.ten_the_loai)).join(', ');
             
             // Build JSON-LD Book Schema
             const bookSchema = {
               "@context": "https://schema.org",
               "@type": "Book",
               "name": story.ten_truyen,
               "description": story.mo_ta?.replace(/<[^>]*>?/gm, ''),
               "author": { "@type": "Person", "name": story.tac_gia?.ten_tac_gia || story.tac_gia || 'Bí danh' },
               "genre": genresText,
               "url": canonicalHref,
             };

             if (story.rating && story.rating_count) {
               bookSchema.aggregateRating = {
                 "@type": "AggregateRating",
                 "ratingValue": story.rating,
                 "bestRating": "5",
                 "ratingCount": story.rating_count
               };
             }

             if (comments && comments.length > 0) {
               bookSchema.review = comments.slice(0, 3).map(c => ({
                 "@type": "Review",
                 "author": { "@type": "Person", "name": c.author_name || 'Ẩn danh' },
                 "reviewBody": c.content,
                 "datePublished": c.created_at
               }));
             }

             seoData = {
                title: `${story.ten_truyen} - Tác giả ${story.tac_gia?.ten_tac_gia || story.tac_gia || 'Bí danh'} | TruyenVietHay`,
                description: story.mo_ta?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Đọc truyện ${story.ten_truyen} chất lượng cực cao.`,
                jsonLd: bookSchema,
                bodyHtml: `
                  <main>
                    <header>
                      <h1>${escapeHtml(story.ten_truyen)}</h1>
                      <p>Tác giả: ${escapeHtml(story.tac_gia?.ten_tac_gia || story.tac_gia || '')}</p>
                      <p>Thể loại: ${genresText}</p>
                      ${story.rating ? `<p>Đánh giá: ${story.rating}/5 (${story.rating_count} lượt)</p>` : ''}
                    </header>
                    <section class="story-synopsis">
                      <h2>Giới Thiệu</h2>
                      <div class="description">${story.mo_ta}</div>
                    </section>
                    <section class="bot-comments-feed">
                      <h2>Bình Luận Mới Nhất</h2>
                      <ul>
                        ${comments.map(c => `<li><strong>${escapeHtml(c.author_name || 'Ẩn danh')}</strong>: ${escapeHtml(c.content)}</li>`).join('\n')}
                      </ul>
                    </section>
                  </main>
                `
             };
         }
      }

      if (seoData) {
          renderedHtml = injectSsrContent(renderedHtml, seoData);
          renderStatus = "injected-ssr";
      }

    } catch (injectError) {
      renderStatus = "template-fallback";
      console.error("seo head inject error:", injectError);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", HEAD_CACHE_CONTROL);
    res.setHeader("x-seo-render", `${RENDER_VERSION}:${renderStatus}`);
    res.setHeader("x-seo-path", normalizedPath);
    return res.status(200).send(renderedHtml);
  } catch (error) {
    console.error("seo render error:", error);
    return res.status(500).send("Unable to render SEO head template.");
  }
}
