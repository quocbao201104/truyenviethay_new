// frontend/api/ssrFetcher.js
// This runs on Vercel Node runtime.

const API_BASE_URL = process.env.VITE_API_URL || "https://api.truyenviethay.id.vn";

/**
 * Fetch Story Detail metadata from backend
 * @param {string} slug 
 * @returns {Promise<Object|null>}
 */
export async function getStoryDetail(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/truyen/slug/${slug}`, {
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) return null;
    const body = await res.json();
    // Assuming backend returns { message: "...", data: { ...story } }
    return body?.data || body;
  } catch (error) {
    console.error("SSR Fetch Story Error:", error);
    return null;
  }
}

/**
 * Fetch Chapter Detail from backend
 * @param {string} storySlug 
 * @param {string} chapterSlug 
 * @returns {Promise<Object|null>}
 */
export async function getChapterDetail(storySlug, chapterSlug) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chuong/slug/${storySlug}/${chapterSlug}`, {
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data || body;
  } catch (error) {
    console.error("SSR Fetch Chapter Error:", error);
    return null;
  }
}
