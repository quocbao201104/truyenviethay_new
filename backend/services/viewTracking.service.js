/**
 * View Tracking Service
 *
 * Quản lý lượt xem chương/truyện với:
 * - Chống spam: TTL 30 phút theo user/IP
 * - Buffer view counts trong node-cache (không ghi trực tiếp vào DB)
 * - Batch sync MySQL qua cronjob (mỗi 5 phút)
 *
 * Dùng node-cache riêng cho view tracking, tách khỏi cache chung.
 */

const redis = require("../utils/redis");
const logger = require("../utils/logger");

// =============================================================================
// CONFIGURATION FOR VIEW TRACKING
// =============================================================================

/** TTL anti-spam: 30 minutes = 1800 seconds for CHAPTER */
const VIEW_SPAM_TTL_SECONDS = 30 * 60;

/** TTL anti-spam: 24 hours = 86400 seconds for NOVEL (Unique View) */
const NOVEL_VIEW_COOLDOWN_SECONDS = 24 * 60 * 60;

/** Prefix for all view tracking keys in Redis */
const REDIS_PREFIX = "view:";

/** Prefix for anti-spam keys */
const SPAM_KEY_PREFIX = `${REDIS_PREFIX}spam:`;

/** Prefix for novel anti-spam keys */
const NOVEL_SPAM_KEY_PREFIX = `${REDIS_PREFIX}spam_novel:`;

/** Prefix for view count buffers */
const NOVEL_VIEW_PREFIX = `${REDIS_PREFIX}novel:`;
const CHAPTER_VIEW_PREFIX = `${REDIS_PREFIX}chapter:`;

// =============================================================================
// ANTI-SPAM (RATE LIMITING WITH TTL)
// =============================================================================

/**
 * Resolve real client IP with Cloudflare support
 * Priority: CF-Connecting-IP > X-Forwarded-For > req.ip
 */
function getClientIp(req) {
  const cfConnectingIp = req.get?.("cf-connecting-ip") || req.headers?.["cf-connecting-ip"];
  if (cfConnectingIp) return String(cfConnectingIp).trim();

  const forwarded = req.get?.("x-forwarded-for") || req.headers?.["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();

  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * Identify user: UserID if logged in, otherwise IP
 */
function getViewerIdentifier(req) {
  if (req.user && req.user.id) {
    return `user_${req.user.id}`;
  }
  const ip = getClientIp(req);
  return `ip_${String(ip).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

/**
 * Check if user viewed this chapter recently
 */
async function hasViewedRecently(viewerId, chapterId) {
  const key = `${SPAM_KEY_PREFIX}${viewerId}:chapter_${chapterId}`;
  const exists = await redis.exists(key);
  return exists === 1;
}

/**
 * Mark chapter as viewed (30m TTL)
 */
async function markAsViewed(viewerId, chapterId) {
  const key = `${SPAM_KEY_PREFIX}${viewerId}:chapter_${chapterId}`;
  await redis.set(key, 1, 'EX', VIEW_SPAM_TTL_SECONDS);
}

/**
 * Check if user viewed this novel recently
 */
async function hasViewedNovelRecently(viewerId, novelId) {
  const key = `${NOVEL_SPAM_KEY_PREFIX}${viewerId}:novel_${novelId}`;
  const exists = await redis.exists(key);
  return exists === 1;
}

/**
 * Mark novel as viewed (24h TTL)
 */
async function markNovelAsViewed(viewerId, novelId) {
  const key = `${NOVEL_SPAM_KEY_PREFIX}${viewerId}:novel_${novelId}`;
  await redis.set(key, 1, 'EX', NOVEL_VIEW_COOLDOWN_SECONDS);
}

// =============================================================================
// VIEW RECORDING (BUFFER)
// =============================================================================

/**
 * Increment view counts in Redis (atomic)
 */
async function incrementViewCounts(novelId, chapterId, shouldIncrementNovel = true) {
  const novelKey = `${NOVEL_VIEW_PREFIX}${novelId}`;
  const chapterKey = `${CHAPTER_VIEW_PREFIX}${chapterId}`;

  await redis.incr(chapterKey);

  if (shouldIncrementNovel) {
    await redis.incr(novelKey);
  }
}

// =============================================================================
// REDIS SCAN HELPERS (avoid KEYS)
// =============================================================================

async function scanKeys(matchPattern, count = 1000) {
  let cursor = "0";
  const keys = [];
  do {
    const [nextCursor, batch] = await redis.scan(cursor, "MATCH", matchPattern, "COUNT", count);
    cursor = nextCursor;
    if (batch && batch.length > 0) {
      keys.push(...batch);
    }
  } while (cursor !== "0");
  return keys;
}

async function countKeys(matchPattern, count = 1000) {
  let cursor = "0";
  let total = 0;
  do {
    const [nextCursor, batch] = await redis.scan(cursor, "MATCH", matchPattern, "COUNT", count);
    cursor = nextCursor;
    if (batch && batch.length > 0) {
      total += batch.length;
    }
  } while (cursor !== "0");
  return total;
}

async function deleteKeysInBatches(keys, batchSize = 500) {
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    if (batch.length > 0) {
      await redis.del(...batch);
    }
  }
}

// =============================================================================
// MAIN FLOW: RECORD VALID VIEW
// =============================================================================

/**
 * Process chapter view
 */
async function recordChapterView(req, novelId, chapterId) {
  const viewerId = getViewerIdentifier(req);

  // 1. Check chapter spam
  const alreadyViewedChapter = await hasViewedRecently(viewerId, chapterId);
  if (alreadyViewedChapter) {
    return { counted: false, reason: "chapter_spam" };
  }

  // 2. Check novel spam
  const shouldIncrementNovel = !(await hasViewedNovelRecently(viewerId, novelId));

  // 3. Mark viewed
  await markAsViewed(viewerId, chapterId);
  if (shouldIncrementNovel) {
    await markNovelAsViewed(viewerId, novelId);
  }

  // 4. Increment buffer
  await incrementViewCounts(novelId, chapterId, shouldIncrementNovel);

  return { 
    counted: true, 
    novelIncremented: shouldIncrementNovel 
  };
}

// =============================================================================
// SNAPSHOT & RESET (For Cronjob)
// =============================================================================

/**
 * Get all view counters from Redis
 */
async function getViewCountsSnapshot() {
  const novels = new Map();
  const chapters = new Map();

  const novelKeys = await scanKeys(`${NOVEL_VIEW_PREFIX}*`);
  const chapterKeys = await scanKeys(`${CHAPTER_VIEW_PREFIX}*`);

  for (const key of novelKeys) {
    const id = parseInt(key.replace(NOVEL_VIEW_PREFIX, ""), 10);
    const val = await redis.get(key);
    if (!isNaN(id) && val) {
      novels.set(id, parseInt(val, 10));
    }
  }

  for (const key of chapterKeys) {
    const id = parseInt(key.replace(CHAPTER_VIEW_PREFIX, ""), 10);
    const val = await redis.get(key);
    if (!isNaN(id) && val) {
      chapters.set(id, parseInt(val, 10));
    }
  }

  return { novels, chapters };
}

/**
 * Reset view counters after successful DB sync
 */
async function resetViewCounts() {
  const novelKeys = await scanKeys(`${NOVEL_VIEW_PREFIX}*`);
  const chapterKeys = await scanKeys(`${CHAPTER_VIEW_PREFIX}*`);
  
  const allKeys = [...novelKeys, ...chapterKeys];
  if (allKeys.length > 0) {
    await deleteKeysInBatches(allKeys, 500);
  }

  return allKeys.length;
}

/**
 * Debug statistics
 */
async function getStats() {
  const [novelCount, chapterCount, spamCount, novelSpamCount] = await Promise.all([
    countKeys(`${NOVEL_VIEW_PREFIX}*`),
    countKeys(`${CHAPTER_VIEW_PREFIX}*`),
    countKeys(`${SPAM_KEY_PREFIX}*`),
    countKeys(`${NOVEL_SPAM_KEY_PREFIX}*`),
  ]);

  return {
    totalKeys: novelCount + chapterCount + spamCount + novelSpamCount,
    novelKeys: novelCount,
    chapterKeys: chapterCount,
    spamKeys: spamCount + novelSpamCount,
  };
}

module.exports = {
  recordChapterView,
  getViewCountsSnapshot,
  resetViewCounts,
  getStats,
  VIEW_SPAM_TTL_SECONDS,
};
