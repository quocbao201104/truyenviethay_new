/**
 * Route-specific rate limiters (Phase 2: Anti-spam)
 * Áp dụng chặt hơn global limiter cho các endpoint tương tác.
 */
const rateLimit = require("express-rate-limit");

const skipInTest = () => process.env.NODE_ENV === "test";

/**
 * POST /api/comments: 10 req/min per user, burst 2/10s
 * Comment cần đăng nhập nên key = user id (middleware auth chạy trước)
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
  ratingLimiter,
  followLimiter,
};
