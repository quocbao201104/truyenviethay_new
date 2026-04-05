import { buildCanonicalHref, resolveSeoPolicyForRoute } from "../src/seo/routePolicy.js";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

import { 
  getStoryDetail, 
  getChapterDetail, 
  getStoryComments,
  getGenreDetail,
  getAuthorDetail,
  getAudioDetail
} from "./ssrFetcher.js";

const DEFAULT_SITE_URL = "https://truyenviethay.id.vn";
const HEAD_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=3600";
const RENDER_VERSION = "route-head-v4-ssr";

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

  if (seoData.jsonLd) {
    const schemaTag = `\n<script type="application/ld+json">\n${JSON.stringify(seoData.jsonLd, null, 2)}\n</script>\n`;
    if (result.includes("</head>")) {
      result = result.replace("</head>", `${schemaTag}\n</head>`);
    }
  }

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

function buildBreadcrumbSchema(siteUrl, items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? (item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`) : undefined,
    })),
  };
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
    
    let robotsPolicy = routePolicy.robots;
    if (normalizedPath.startsWith("/truyen-chu/") || normalizedPath.startsWith("/truyen-audio/")) {
        robotsPolicy = "index, follow";
    }

    const templateHtml = await loadIndexTemplate(origin);
    let renderedHtml = templateHtml;
    let renderStatus = "injected";
    let seoDataList = [];

    try {
      renderedHtml = injectHeadSignals(templateHtml, canonicalHref, robotsPolicy);

      const storyMatch = normalizedPath.match(/^\/truyen-chu\/([^/]+)$/);
      const chapterMatch = normalizedPath.match(/^\/truyen-chu\/([^/]+)\/([^/]+)$/);
      const audioMatch = normalizedPath.match(/^\/truyen-audio\/([^/]+)$/);
      const authorMatch = normalizedPath.match(/^\/tac-gia\/([^/]+)$/);
      const genreMatch = normalizedPath === "/the-loai";

      if (chapterMatch) {
         const [_, storySlug, chapterSlug] = chapterMatch;
         const chapter = await getChapterDetail(storySlug, chapterSlug);
         if (chapter) {
             const bc = buildBreadcrumbSchema(siteUrl, [
                 { name: "Trang chủ", url: "/" },
                 { name: chapter.story_name || "Truyện", url: `/truyen-chu/${storySlug}` },
                 { name: chapter.ten_chuong }
             ]);
             seoDataList.push({
                 title: `${chapter.ten_chuong} - ${chapter.story_name || 'Truyện'} | TruyenVietHay`,
                 description: `Đọc ${chapter.ten_chuong} của truyện ${chapter.story_name || 'Tiên Hiệp'} online mượt mà. Cập nhật mới nhất.`,
                 jsonLd: bc,
                 bodyHtml: `<article><h1>${escapeHtml(chapter.ten_chuong)}</h1><div class="chapter-content">${chapter.noi_dung}</div></article>`
             });
         }
      } else if (storyMatch) {
         const [_, storySlug] = storyMatch;
         const story = await getStoryDetail(storySlug);
         if (story) {
             const genresText = (story.genres || []).map(g => escapeHtml(g.ten_theloai || g.ten_the_loai)).join(', ');
             
             const bookSchema = {
               "@context": "https://schema.org",
               "@type": "Book",
               "name": story.ten_truyen,
               "description": story.mo_ta?.replace(/<[^>]*>?/gm, ''),
               "author": { "@type": "Person", "name": story.tac_gia?.ten_tac_gia || story.tac_gia || 'Bí danh' },
               "genre": genresText,
               "url": canonicalHref,
             };

             const bc = buildBreadcrumbSchema(siteUrl, [
                 { name: "Trang chủ", url: "/" },
                 { name: "Truyện chữ", url: "/truyen-chu" },
                 { name: story.ten_truyen }
             ]);

             seoDataList.push({
                title: `${story.ten_truyen} - Tác giả ${story.tac_gia?.ten_tac_gia || story.tac_gia || 'Bí danh'} | TruyenVietHay`,
                description: story.mo_ta?.replace(/<[^>]*>?/gm, '').substring(0, 160),
                jsonLd: [bookSchema, bc],
                bodyHtml: `<main><h1>${escapeHtml(story.ten_truyen)}</h1><p>Tác giả: ${escapeHtml(story.tac_gia?.ten_tac_gia || story.tac_gia || "")}</p><div class="description">${story.mo_ta}</div></main>`
             });
         }
      } else if (audioMatch) {
          const [_, audioSlug] = audioMatch;
          const story = await getAudioDetail(audioSlug);
          if (story) {
              const bc = buildBreadcrumbSchema(siteUrl, [
                  { name: "Trang chủ", url: "/" },
                  { name: "Truyện audio", url: "/truyen-audio" },
                  { name: story.ten_truyen }
              ]);
              seoDataList.push({
                  title: `Nghe ${story.ten_truyen} Audio - Bản dịch chuẩn | TruyenVietHay`,
                  description: `Nghe audio truyện ${story.ten_truyen} chất lượng cao, giọng đọc AI/Người chân thực.`,
                  jsonLd: [bc, { "@type": "AudioObject", "name": story.ten_truyen, "contentUrl": canonicalHref }],
                  bodyHtml: `<main><h1>Nghe truyện ${escapeHtml(story.ten_truyen)}</h1><div class="audio-description">${story.mo_ta}</div></main>`
              });
          }
      } else if (genreMatch && routeQuery.categories) {
          const genre = await getGenreDetail(routeQuery.categories);
          if (genre) {
              const bc = buildBreadcrumbSchema(siteUrl, [
                  { name: "Trang chủ", url: "/" },
                  { name: "Thể loại", url: "/the-loai" },
                  { name: genre.ten_theloai }
              ]);
              seoDataList.push({
                  title: `Truyện ${genre.ten_theloai} hay nhất 2024 | TruyenVietHay`,
                  description: `Danh sách truyện thuộc thể loại ${genre.ten_theloai} được cập nhật sớm nhất tại TruyenVietHay.`,
                  jsonLd: bc,
                  bodyHtml: `<main><h1>Truyện thể loại ${escapeHtml(genre.ten_theloai)}</h1></main>`
              });
          }
      } else if (authorMatch) {
          const [_, authorSlug] = authorMatch;
          const author = await getAuthorDetail(authorSlug);
          if (author) {
              const bc = buildBreadcrumbSchema(siteUrl, [
                  { name: "Trang chủ", url: "/" },
                  { name: "Tác giả" },
                  { name: author.ten_tac_gia }
              ]);
              seoDataList.push({
                  title: `Tác giả ${author.ten_tac_gia} - Danh sách truyện hay | TruyenVietHay`,
                  description: `Tổng hợp tất cả các tác phẩm của tác giả ${author.ten_tac_gia} trên TruyenVietHay.`,
                  jsonLd: bc,
                  bodyHtml: `<main><h1>Tác giả ${escapeHtml(author.ten_tac_gia)}</h1></main>`
              });
          }
      }

      if (seoDataList.length > 0) {
          for (const data of seoDataList) {
              renderedHtml = injectSsrContent(renderedHtml, data);
          }
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
