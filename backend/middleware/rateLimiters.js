/**
 * Route-specific rate limiters (Phase 2: Anti-spam)
 * �p d?ng ch?t hon global limiter cho c�c endpoint tuong t�c.
 */
const rateLimit = require("express-rate-limit");

const skipInTest = () => process.env.NODE_ENV === "test";

const getClientIp = (req) => {
  const cfConnectingIp = req.get?.("cf-connecting-ip") || req.headers?.["cf-connecting-ip"];
  if (cfConnectingIp) return String(cfConnectingIp).trim();

  const forwarded = req.get?.("x-forwarded-for") || req.headers?.["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();

  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";
};

/**
 * POST /api/comments: 10 req/min per user, burst 2/10s
 * Comment c?n dang nh?p nn key = user id (middleware auth ch?y tru?c)
 */
const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Quá nhiều bình luận. Vui lòng thử lại sau 1 phút." },
  statusCode: 429,
  keyGenerator: (req) => (req.user?.id ? `comment:${req.user.id}` : `comment:ip:${req.ip}`),
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/chuong/:id/view: limit to prevent abuse
 */
const chapterViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Qua nhiều lượt xem. Vui lòng thử lại sau." },
  statusCode: 429,
  keyGenerator: (req) => {
    const userId = req.user?.id;
    if (userId) return `chapter_view:user:${userId}`;
    return `chapter_view:ip:${getClientIp(req)}`;
  },
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/ratings: cooldown 15s per (user_id, truyen_id)
 */
const ratingLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 1,
  message: { message: "Vui lòng đợi 15 giây trước khi đổi đánh giá." },
  statusCode: 429,
  keyGenerator: (req) => {
    const userId = req.user?.id ?? req.ip;
    const truyenId = req.body?.truyenId ?? "unknown";
    return `rating:${userId}:${truyenId}`;
  },
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/follow/:truyenId: debounce 3s per (user_id, truyen_id)
 */
const followLimiter = rateLimit({
  windowMs: 3 * 1000,
  max: 1,
  message: { message: "Vui lòng đợi vài giây trước khi thao tác tiếp." },
  statusCode: 429,
  keyGenerator: (req) => {
    const userId = req.user?.id ?? req.ip;
    const truyenId = req.params?.truyenId ?? "unknown";
    return `follow:${userId}:${truyenId}`;
  },
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  commentLimiter,
  chapterViewLimiter,
  ratingLimiter,
  followLimiter,
};