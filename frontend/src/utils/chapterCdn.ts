const DEFAULT_CDN_BASE = "https://cdn.truyenviethay.id.vn";

export const getCdnBaseUrl = () =>
  (import.meta.env.VITE_CDN_BASE_URL || DEFAULT_CDN_BASE).replace(/\/+$/, "");

export const buildChapterCdnUrl = (
  storyId: number,
  chapterId: number,
  version?: string | null
) => {
  const base = getCdnBaseUrl();
  const v = version ? `?v=${encodeURIComponent(version)}` : "";
  return `${base}/chapters/${storyId}/${chapterId}.json${v}`;
};
