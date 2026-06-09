module.exports = function errorHandler(err, req, res, next) {
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ message: "Origin not allowed by CORS policy" });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large" });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(413).json({ message: "Too many files uploaded" });
  }

  console.error("[API ERROR]", req.method, req.originalUrl, err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    message: err.message || "Server error",
    ...(process.env.NODE_ENV !== "production" && err.stack ? { stack: err.stack } : {}),
  });
};
