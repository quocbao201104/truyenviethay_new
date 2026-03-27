const TRACKING_PARAM_PREFIXES = ["utm_", "fbclid", "gclid"];

const NOINDEX_ROUTE_NAMES = new Set([
  "Login",
  "Register",
  "Profile",
  "ProfileSettings",
  "Favorites",
  "Tasks",
  "History",
  "FollowedAuthors",
  "AdminDashboard",
  "AdminManageUsers",
  "AdminManageStories",
  "AuthorStoryManagement",
  "AuthorDashboard",
  "SubmitStory",
  "AuthorChapterManagement",
  "AuthorAddChapter",
  "AuthorEditChapter",
  "AuthorApply",
  "SearchView",
  "NotFound",
]);

function normalizePath(path = "/") {
  if (!path) return "/";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

function normalizeRouteQuery(query = {}) {
  const sanitized = {};

  Object.entries(query || {}).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null || rawValue === "") return;

    const keyLower = String(key).toLowerCase();
    if (TRACKING_PARAM_PREFIXES.some((prefix) => keyLower.startsWith(prefix))) return;

    if (Array.isArray(rawValue)) {
      const normalized = rawValue.map((item) => String(item)).filter(Boolean);
      if (normalized.length) sanitized[key] = normalized;
      return;
    }

    sanitized[key] = String(rawValue);
  });

  return sanitized;
}

function getFirstQueryValue(value) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (value == null) return "";
  return String(value);
}

function toPositiveInteger(value, fallback = 1) {
  const parsed = Number.parseInt(getFirstQueryValue(value), 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

function isPrivateOrUtilityPath(pathname) {
  return (
    pathname === "/dang-nhap" ||
    pathname === "/dang-ky" ||
    pathname.startsWith("/user") ||
    pathname.startsWith("/admin")
  );
}

function isKnownPublicPath(pathname) {
  if (
    pathname === "/" ||
    pathname === "/truyen-chu" ||
    pathname === "/truyen-audio" ||
    pathname === "/the-loai" ||
    pathname === "/truyen-hot" ||
    pathname === "/xep-hang" ||
    pathname === "/tim-kiem" ||
    pathname === "/chinh-sach-bao-mat" ||
    pathname === "/dieu-khoan-su-dung" ||
    pathname === "/ban-quyen" ||
    pathname === "/lien-he"
  ) {
    return true;
  }

  if (
    pathname.startsWith("/truyen-chu/") ||
    pathname.startsWith("/truyen-audio/") ||
    pathname.startsWith("/tac-gia/") ||
    pathname.startsWith("/the_loai/") ||
    pathname.startsWith("/truyen-tranh/")
  ) {
    return true;
  }

  return false;
}

function withCanonical(path, canonicalQuery, robots) {
  return {
    canonicalPath: normalizePath(path),
    canonicalQuery: canonicalQuery || {},
    robots,
  };
}

export function resolveSeoPolicyForRoute({
  routeName = "",
  pathname = "/",
  query = {},
  params = {},
} = {}) {
  const normalizedPath = normalizePath(pathname);
  const sanitizedQuery = normalizeRouteQuery(query);
  const page = toPositiveInteger(sanitizedQuery.page, 1);

  if (normalizedPath === "/tim-kiem" || routeName === "SearchView") {
    return withCanonical("/tim-kiem", {}, "noindex, follow");
  }

  if (normalizedPath === "/truyen-audio" || routeName === "StoryAudioList") {
    const hasFilterQuery =
      Boolean(getFirstQueryValue(sanitizedQuery.sort)) ||
      Boolean(getFirstQueryValue(sanitizedQuery.status)) ||
      Boolean(getFirstQueryValue(sanitizedQuery.genres));

    const canonicalQuery = {};
    if (page > 1) canonicalQuery.page = page;

    return withCanonical(
      "/truyen-audio",
      canonicalQuery,
      hasFilterQuery || page > 1 ? "noindex, follow" : "index, follow",
    );
  }

  if (normalizedPath === "/the-loai" || routeName === "Categories") {
    const rawCategories = getFirstQueryValue(sanitizedQuery.categories);
    const selectedCategories = rawCategories
      .split(",")
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isInteger(value) && value > 0);

    const hasSortQuery =
      Boolean(getFirstQueryValue(sanitizedQuery.sort)) &&
      getFirstQueryValue(sanitizedQuery.sort) !== "thoi_gian_cap_nhat";

    const hasSingleCategory = selectedCategories.length === 1;
    const hasMultiCategory = selectedCategories.length > 1;

    const canonicalQuery = {};
    if (hasSingleCategory) canonicalQuery.categories = selectedCategories[0];
    if (page > 1) canonicalQuery.page = page;

    return withCanonical(
      "/the-loai",
      canonicalQuery,
      hasSortQuery || hasMultiCategory || page > 1 ? "noindex, follow" : "index, follow",
    );
  }

  if (normalizedPath.startsWith("/the_loai") || routeName === "StoriesByCategory") {
    const legacyIdFromParams = Number.parseInt(String(params.id || ""), 10);
    const legacyIdFromPath = Number.parseInt(normalizedPath.replace("/the_loai/", ""), 10);
    const legacyId = Number.isInteger(legacyIdFromParams) && legacyIdFromParams > 0
      ? legacyIdFromParams
      : legacyIdFromPath;
    const canonicalQuery = Number.isInteger(legacyId) && legacyId > 0 ? { categories: legacyId } : {};
    return withCanonical("/the-loai", canonicalQuery, "noindex, follow");
  }

  if (normalizedPath === "/truyen-tranh") {
    return withCanonical("/truyen-audio", {}, "noindex, follow");
  }

  if (normalizedPath.startsWith("/truyen-tranh/")) {
    return withCanonical(normalizedPath.replace("/truyen-tranh/", "/truyen-audio/"), {}, "noindex, follow");
  }

  if (routeName && NOINDEX_ROUTE_NAMES.has(String(routeName))) {
    return withCanonical(normalizedPath, {}, "noindex, follow");
  }

  if (isPrivateOrUtilityPath(normalizedPath)) {
    return withCanonical(normalizedPath, {}, "noindex, follow");
  }

  if (!isKnownPublicPath(normalizedPath)) {
    return withCanonical(normalizedPath, {}, "noindex, follow");
  }

  return withCanonical(normalizedPath, {}, "index, follow");
}

export function buildCanonicalHref(siteUrl, canonicalPath, canonicalQuery = {}) {
  const normalizedSiteUrl = String(siteUrl || "").replace(/\/+$/, "");
  const safeSiteUrl = normalizedSiteUrl || "https://truyenviethay.id.vn";
  const canonicalBase = `${safeSiteUrl}${normalizePath(canonicalPath || "/")}`;
  const params = new URLSearchParams();

  Object.keys(canonicalQuery)
    .sort()
    .forEach((key) => {
      const value = canonicalQuery[key];
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== "") {
            params.append(key, String(item));
          }
        });
        return;
      }
      if (value === undefined || value === null || value === "") return;
      params.set(key, String(value));
    });

  const queryString = params.toString();
  return queryString ? `${canonicalBase}?${queryString}` : canonicalBase;
}

