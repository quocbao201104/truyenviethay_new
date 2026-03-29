/**
 * Route-specific rate limiters (Phase 2: Anti-spam)
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

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Qua nhieu binh luan. Vui long thu lai sau 1 phut." },
  statusCode: 429,
  keyGenerator: (req) => (req.user?.id ? `comment:${req.user.id}` : `comment:ip:${req.ip}`),
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
});

const chapterViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Qua nhieu luot xem. Vui long thu lai sau." },
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

const ratingLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 1,
  message: { message: "Vui long doi 15 giay truoc khi doi danh gia." },
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

const followLimiter = rateLimit({
  windowMs: 3 * 1000,
  max: 1,
  message: { message: "Vui long doi vai giay truoc khi thao tac tiep." },
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

const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Ban dang gui report qua nhanh. Vui long thu lai sau 1 phut." },
  statusCode: 429,
  keyGenerator: (req) => {
    const userId = req.user?.id;
    if (userId) return `report:${userId}`;
    return `report:ip:${getClientIp(req)}`;
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
  reportLimiter,
};
