const rateLimit = require("express-rate-limit");

/** Public GET routes readers hit often — do not count toward the API cap. */
function isPublicRead(req) {
  if (req.method !== "GET") return false;
  const path = (req.originalUrl || req.url || "").split("?")[0];
  if (path === "/api/health" || path === "/api/live/active") return true;
  if (path === "/api/categories" || path === "/api/ads") return true;
  if (path === "/api/articles" || path === "/api/articles/trending") return true;
  if (path.startsWith("/api/articles/search")) return true;
  if (path.startsWith("/api/search")) return true;
  if (/^\/api\/articles\/[^/]+$/.test(path) && !path.includes("/admin")) return true;
  return false;
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_API || "300", 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: isPublicRead,
  message: { message: "Too many requests — please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AUTH || "20", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts — please try again later" },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(
    process.env.RATE_LIMIT_UPLOAD ||
      (process.env.NODE_ENV === "production" ? "60" : "200"),
    10
  ),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Upload limit reached — try again later" },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter, isPublicRead };
