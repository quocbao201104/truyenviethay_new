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
  ratingValue?: number;
  ratingCount?: number;
  reviews?: Array<{
    author: string;
    content: string;
    date: string;
  }>;
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
  
  if (options.ratingValue && options.ratingCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: options.ratingValue,
      bestRating: "5",
      ratingCount: options.ratingCount,
    };
  }

  if (options.reviews?.length) {
    schema.review = options.reviews.map(r => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewBody: r.content,
      datePublished: r.date,
    }));
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

export interface AuthorSchemaOptions {
  penName: string;
  authorId: number | string;
  bio?: string | null;
  totalStories?: number;
  avatarUrl?: string | null;
}

/**
 * JSON-LD schema for an author profile page.
 * Type: ProfilePage + Person + BreadcrumbList
 * BreadcrumbList: Trang chủ → Tác giả → {penName}
 */
export function buildAuthorSchema(options: AuthorSchemaOptions) {
  const url = `${siteUrl}/tac-gia/${options.authorId}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `Tác giả ${options.penName}`,
    url,
    mainEntity: {
      "@type": "Person",
      name: options.penName,
      url,
    },
    breadcrumb: buildBreadcrumbListSchema([
      { name: "Trang chủ", url: siteUrl },
      { name: "Tác giả", url: `${siteUrl}/tac-gia` },
      { name: options.penName, url },
    ]),
  };

  if (options.bio) schema.mainEntity.description = options.bio;
  if (options.avatarUrl) schema.mainEntity.image = options.avatarUrl;

  return schema;
}
