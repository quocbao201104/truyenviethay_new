const db = require("../config/db");
const { getOrSet } = require("../utils/cache");

const ACTIVE_STORY_CLAUSE = `(tn.is_deleted = 0 OR tn.is_deleted IS NULL)`;
const SITEMAP_CACHE_TTL_SECONDS = 900;
const DEFAULT_SITE_URL = "https://truyenviethay.id.vn";
const DEFAULT_CHAPTERS_PER_FILE = 10000;
const DEFAULT_MIN_STORIES_PER_CATEGORY = 1;

const STATIC_PATHS = [
  "/",
  "/truyen-chu",
  "/truyen-audio",
  "/the-loai",
  "/truyen-hot",
  "/xep-hang",
  "/chinh-sach-bao-mat",
  "/dieu-khoan-su-dung",
  "/ban-quyen",
  "/lien-he",
];

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveSiteUrl() {
  const configured =
    process.env.SITEMAP_SITE_URL ||
    process.env.CLIENT_URL ||
    process.env.CLIENT_URLS ||
    DEFAULT_SITE_URL;
  const firstUrl = String(configured).split(",")[0].trim();
  return (firstUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function shouldIncludeAudioSitemap() {
  const flag = String(process.env.SITEMAP_INCLUDE_AUDIO || "").toLowerCase().trim();
  return ["1", "true", "yes", "on"].includes(flag);
}

function toAbsoluteUrl(path, siteUrl = resolveSiteUrl()) {
  if (!path) return siteUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // encodeURI giúp mã hóa các ký tự Unicode nhưng giữ lại các ký tự cấu trúc URL như / ? =
  return `${siteUrl}${encodeURI(normalizedPath)}`;
}

function normalizeDateValue(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  const mysqlDateTime = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  const normalized = mysqlDateTime.test(raw) ? raw.replace(" ", "T") + "Z" : raw;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function escapeXml(input) {
  if (!input) return "";
  return String(input)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderUrlSet(entries) {
  const rows = entries
    .map((entry) => {
      try {
        if (!entry.loc) return "";
        const parts = [`<loc>${escapeXml(entry.loc)}</loc>`];
        if (entry.lastmod) {
          parts.push(`<lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
        }
        return `  <url>${parts.join("")}</url>\n`;
      } catch (err) {
        console.error(`[Sitemap Error] Skip entry:`, entry, err.message);
        return "";
      }
    })
    .filter(Boolean)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}</urlset>`;
}

function renderSitemapIndex(entries) {
  const rows = entries
    .map((entry) => {
      try {
        if (!entry.loc) return "";
        const parts = [`<loc>${escapeXml(entry.loc)}</loc>`];
        if (entry.lastmod) {
          parts.push(`<lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
        }
        return `  <sitemap>${parts.join("")}</sitemap>\n`;
      } catch (err) {
        console.error(`[Sitemap Error] Skip index entry:`, entry, err.message);
        return "";
      }
    })
    .filter(Boolean)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}</sitemapindex>`;
}

async function getStaticEntries(siteUrl) {
  return STATIC_PATHS.map((path) => ({ loc: toAbsoluteUrl(path, siteUrl) }));
}

async function getStoryEntries(siteUrl) {
  const rows = await getOrSet("sitemap:stories:rows", SITEMAP_CACHE_TTL_SECONDS, async () => {
    const [result] = await db.query(
      `SELECT
         tn.slug,
         GREATEST(
           COALESCE(tn.thoi_gian_cap_nhat, tn.thoi_gian_tao),
           COALESCE(ch.latest_chapter_at, '1970-01-01 00:00:00')
         ) AS lastmod
       FROM truyen_new tn
       LEFT JOIN (
         SELECT c.truyen_id, MAX(c.thoi_gian_dang) AS latest_chapter_at
         FROM chuong c
         WHERE c.trang_thai = 'da_duyet'
           AND c.is_chuong_mau = 0
         GROUP BY c.truyen_id
       ) ch ON ch.truyen_id = tn.id
       WHERE tn.trang_thai_kiem_duyet = 'duyet'
         AND ${ACTIVE_STORY_CLAUSE}
         AND tn.slug IS NOT NULL
         AND tn.slug <> ''
         AND tn.so_luong_chuong > 0
       ORDER BY tn.id ASC`,
    );
    return result;
  });

  return rows
    .map((row) => ({
      loc: toAbsoluteUrl(`/truyen-chu/${row.slug}`, siteUrl),
      lastmod: normalizeDateValue(row.lastmod),
    }))
    .filter((row) => !!row.loc);
}

async function getCategoryEntries(siteUrl) {
  const minStories = parseInteger(
    process.env.SITEMAP_MIN_STORIES_PER_CATEGORY,
    DEFAULT_MIN_STORIES_PER_CATEGORY,
  );

  const rows = await getOrSet(
    `sitemap:categories:rows:min:${minStories}`,
    SITEMAP_CACHE_TTL_SECONDS,
    async () => {
      const [result] = await db.query(
        `SELECT
           tl.id_theloai,
           MAX(COALESCE(tn.thoi_gian_cap_nhat, tn.thoi_gian_tao)) AS lastmod,
           COUNT(DISTINCT tn.id) AS story_count
         FROM theloai_new tl
         INNER JOIN truyen_theloai tt ON tt.theloai_id = tl.id_theloai
         INNER JOIN truyen_new tn ON tn.id = tt.truyen_id
         WHERE tn.trang_thai_kiem_duyet = 'duyet'
           AND ${ACTIVE_STORY_CLAUSE}
           AND tn.slug IS NOT NULL
           AND tn.slug <> ''
           AND tn.so_luong_chuong > 0
         GROUP BY tl.id_theloai
         HAVING story_count >= ?
         ORDER BY tl.id_theloai ASC`,
        [minStories],
      );
      return result;
    },
  );

  return rows
    .map((row) => ({
      loc: toAbsoluteUrl(`/the-loai?categories=${row.id_theloai}`, siteUrl),
      lastmod: normalizeDateValue(row.lastmod),
    }))
    .filter((row) => !!row.loc);
}

async function getChapterStats() {
  return await getOrSet("sitemap:chapters:stats", SITEMAP_CACHE_TTL_SECONDS, async () => {
    const [rows] = await db.query(
      `SELECT
         COUNT(*) AS total,
         MAX(c.thoi_gian_dang) AS latest_lastmod
       FROM chuong c
       INNER JOIN truyen_new tn ON tn.id = c.truyen_id
       WHERE c.trang_thai = 'da_duyet'
         AND c.is_chuong_mau = 0
         AND c.slug IS NOT NULL
         AND c.slug <> ''
         AND tn.trang_thai_kiem_duyet = 'duyet'
         AND ${ACTIVE_STORY_CLAUSE}
         AND tn.slug IS NOT NULL
         AND tn.slug <> ''`,
    );
    return rows[0] || { total: 0, latest_lastmod: null };
  });
}

async function getChapterEntries(page, siteUrl) {
  const chaptersPerFile = parseInteger(
    process.env.SITEMAP_CHAPTERS_PER_FILE,
    DEFAULT_CHAPTERS_PER_FILE,
  );
  const safePage = Math.max(1, parseInteger(page, 1));
  const offset = (safePage - 1) * chaptersPerFile;

  const rows = await getOrSet(
    `sitemap:chapters:rows:p:${safePage}:size:${chaptersPerFile}`,
    SITEMAP_CACHE_TTL_SECONDS,
    async () => {
      const [result] = await db.query(
        `SELECT
           tn.slug AS story_slug,
           c.slug AS chapter_slug,
           c.thoi_gian_dang AS lastmod
         FROM chuong c
         INNER JOIN truyen_new tn ON tn.id = c.truyen_id
         WHERE c.trang_thai = 'da_duyet'
           AND c.is_chuong_mau = 0
           AND c.slug IS NOT NULL
           AND c.slug <> ''
           AND tn.trang_thai_kiem_duyet = 'duyet'
           AND ${ACTIVE_STORY_CLAUSE}
           AND tn.slug IS NOT NULL
           AND tn.slug <> ''
         ORDER BY c.id ASC
         LIMIT ? OFFSET ?`,
        [chaptersPerFile, offset],
      );
      return result;
    },
  );

  return rows
    .map((row) => ({
      loc: toAbsoluteUrl(`/truyen-chu/${row.story_slug}/${row.chapter_slug}`, siteUrl),
      lastmod: normalizeDateValue(row.lastmod),
    }))
    .filter((row) => !!row.loc);
}

async function getAudioEntries(siteUrl) {
  if (!shouldIncludeAudioSitemap()) return [];

  const rows = await getOrSet("sitemap:audio:rows", SITEMAP_CACHE_TTL_SECONDS, async () => {
    const [result] = await db.query(
      `SELECT
         tn.slug,
         GREATEST(
           COALESCE(audio_meta.latest_audio_at, '1970-01-01 00:00:00'),
           COALESCE(tn.thoi_gian_cap_nhat, tn.thoi_gian_tao)
         ) AS lastmod
       FROM truyen_new tn
       INNER JOIN (
         SELECT ap.truyen_id, MAX(ap.created_at) AS latest_audio_at
         FROM audio_parts ap
         GROUP BY ap.truyen_id
       ) audio_meta ON audio_meta.truyen_id = tn.id
       WHERE tn.trang_thai_kiem_duyet = 'duyet'
         AND ${ACTIVE_STORY_CLAUSE}
         AND tn.slug IS NOT NULL
         AND tn.slug <> ''
         AND tn.has_audio = 1
       ORDER BY tn.id ASC`,
    );
    return result;
  });

  return rows
    .map((row) => ({
      loc: toAbsoluteUrl(`/truyen-audio/${row.slug}`, siteUrl),
      lastmod: normalizeDateValue(row.lastmod),
    }))
    .filter((row) => !!row.loc);
}

async function getSitemapIndexEntries(siteUrl) {
  const chapterStats = await getChapterStats();
  const chaptersPerFile = parseInteger(
    process.env.SITEMAP_CHAPTERS_PER_FILE,
    DEFAULT_CHAPTERS_PER_FILE,
  );
  const chapterPages = Math.ceil((Number(chapterStats.total) || 0) / chaptersPerFile);
  const chapterLastmod = normalizeDateValue(chapterStats.latest_lastmod);

  const indexEntries = [
    { loc: toAbsoluteUrl("/sitemaps/static.xml", siteUrl) },
    { loc: toAbsoluteUrl("/sitemaps/stories.xml", siteUrl) },
    { loc: toAbsoluteUrl("/sitemaps/categories.xml", siteUrl) },
  ];

  for (let page = 1; page <= chapterPages; page += 1) {
    indexEntries.push({
      loc: toAbsoluteUrl(`/sitemaps/chapters-${page}.xml`, siteUrl),
      lastmod: chapterLastmod,
    });
  }

  if (shouldIncludeAudioSitemap()) {
    indexEntries.push({ loc: toAbsoluteUrl("/sitemaps/audio.xml", siteUrl) });
  }

  return indexEntries;
}

module.exports = {
  resolveSiteUrl,
  getChapterStats,
  getChapterEntries,
  getStoryEntries,
  getCategoryEntries,
  getAudioEntries,
  getStaticEntries,
  getSitemapIndexEntries,
  renderUrlSet,
  renderSitemapIndex,
  shouldIncludeAudioSitemap,
};
