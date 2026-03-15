/**
 * Express app factory - dùng cho index.js và test
 */
require("dotenv").config();
const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const errorMiddleware = require("./middleware/errorHandler");

const app = express();

// Trust first proxy (Cloudflare / reverse proxy) for correct IP detection
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://truyen-viet-hay.vercel.app",
      "https://truyenviethay.id.vn",
      "https://www.truyenviethay.id.vn"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Length", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(compression());
app.use(xssClean());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.options("*", cors());

app.get("/healthcheck", (req, res) => res.status(200).send("OK"));

const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "test") logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/truyen", require("./routes/story.routes"));
app.use("/api/chuong", require("./routes/chapter.routes"));
app.use("/api/upload-truyen", require("./routes/up_story.routes"));
app.use("/api/theloai", require("./routes/category.routes"));
app.use("/api/history", require("./routes/history.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use("/api/follow", require("./routes/follow.routes"));
app.use("/api/like", require("./routes/like.routes"));
app.use("/api/user", require("./routes/profile.routes"));
app.use("/api/admin/users", require("./routes/user.routes"));
app.use("/api/levels", require("./routes/userLevel.routes"));
app.use("/api/levels/history", require("./routes/levelHistory.routes"));
app.use("/api/points", require("./routes/points.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/rewards", require("./routes/reward.routes"));
app.use("/api/user-rewards", require("./routes/userReward.routes"));
app.use("/api/ratings", require("./routes/rating.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/currency", require("./routes/currency.routes"));
app.use("/api/badges", require("./routes/badge.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));
app.use("/api/author", require("./routes/author.routes"));
app.use("/api/authors", require("./routes/authors.routes"));
app.use("/api/admin", require("./routes/admin.cache.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use("/api/shop", require("./routes/shop.routes"));
app.use("/api/mailbox", require("./routes/mailbox.routes"));

app.get("/", (req, res) => res.send("Server is awake!"));

app.use((req, res) => {
  if (process.env.NODE_ENV !== "test") logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Tuyến đường không tồn tại" });
});

app.use(errorMiddleware);

module.exports = app;
