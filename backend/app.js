const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const { ensureUploadDirs, UPLOAD_ROOT } = require("./utils/ensureUploadDirs");
const { getCorsOptions } = require("./utils/corsConfig");
const httpsRedirect = require("./middleware/httpsRedirect");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

ensureUploadDirs();

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(httpsRedirect);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

app.use("/api", apiLimiter);

app.use("/uploads", (req, res, next) => {
  const rel = req.path.replace(/^\/+/, "");
  const filePath = path.join(UPLOAD_ROOT, rel);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }
  next();
}, express.static(UPLOAD_ROOT));

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/articles", require("./routes/articleRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/likes", require("./routes/likeRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));
app.use("/api/ads", require("./routes/adRoutes"));
app.use("/api/live", require("./routes/liveStreamRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));
app.use("/api/live-events", require("./routes/liveEventRoutes"));
app.use("/api/breaking", require("./routes/breakingNewsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/media", require("./routes/mediaRoutes"));
app.use("/api/seo", require("./routes/seoRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "News Portal API Running" });
});

app.use(errorHandler);

module.exports = app;
