import { siteUrl } from "./site";

// ── Internal ──────────────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  url: string;
}

function buildBreadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── Public Builders ───────────────────────────────────────────────────

export interface BookSchemaOptions {
  name: string;
  slug: string;
  author?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  genres?: string[];
  chapterCount?: number;
}

/**
 * JSON-LD schema for a story detail page.
 * Type: Book + BreadcrumbList
 * BreadcrumbList: Trang chủ → Truyện Chữ → {name}
 */
export function buildBookSchema(options: BookSchemaOptions) {
  const url = `${siteUrl}/truyen-chu/${options.slug}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: options.name,
    url,
    inLanguage: "vi",
    breadcrumb: buildBreadcrumbListSchema([
      { name: "Trang chủ", url: siteUrl },
      { name: "Truyện Chữ", url: `${siteUrl}/truyen-chu` },
      { name: options.name, url },
    ]),
  };

  if (options.author) schema.author = { "@type": "Person", name: options.author };
  if (options.description) schema.description = options.description;
  if (options.coverUrl) schema.image = options.coverUrl;
  if (options.genres?.length) schema.genre = options.genres;
  if (options.chapterCount && options.chapterCount > 0) {
    schema.numberOfPages = options.chapterCount;
  }

  return schema;
}

export interface ArticleSchemaOptions {
  chapterTitle: string;
  chapterSlug: string;
  storyName: string;
  storySlug: string;
}

/**
 * JSON-LD schema for a chapter reading page.
 * Type: Article (isPartOf Book) + BreadcrumbList
 * BreadcrumbList: Trang chủ → {storyName} → {chapterTitle}
 */
export function buildArticleSchema(options: ArticleSchemaOptions) {
  const storyUrl = `${siteUrl}/truyen-chu/${options.storySlug}`;
  const chapterUrl = `${storyUrl}/${options.chapterSlug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.chapterTitle,
    name: options.chapterTitle,
    url: chapterUrl,
    inLanguage: "vi",
    isPartOf: {
      "@type": "Book",
      name: options.storyName,
      url: storyUrl,
    },
    breadcrumb: buildBreadcrumbListSchema([
      { name: "Trang chủ", url: siteUrl },
      { name: options.storyName, url: storyUrl },
      { name: options.chapterTitle, url: chapterUrl },
    ]),
  };
}

export interface AudioObjectSchemaOptions {
  name: string;
  slug: string;
  description?: string | null;
  coverUrl?: string | null;
  author?: string | null;
}

/**
 * JSON-LD schema for an audio story page.
 * Type: AudioObject + BreadcrumbList
 * BreadcrumbList: Trang chủ → Nghe Truyện Audio → {name}
 * Note: contentUrl is intentionally omitted — audio parts are dynamic CDN URLs,
 * not stable permanent URLs suitable for schema embedding.
 */
export function buildAudioObjectSchema(options: AudioObjectSchemaOptions) {
  const url = `${siteUrl}/truyen-audio/${options.slug}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: `${options.name} - Nghe truyện audio`,
    url,
    inLanguage: "vi",
    breadcrumb: buildBreadcrumbListSchema([
      { name: "Trang chủ", url: siteUrl },
      { name: "Nghe Truyện Audio", url: `${siteUrl}/truyen-audio` },
      { name: options.name, url },
    ]),
  };

  if (options.description) schema.description = options.description;
  if (options.coverUrl) schema.thumbnailUrl = options.coverUrl;
  if (options.author) schema.author = { "@type": "Person", name: options.author };

  return schema;
}
