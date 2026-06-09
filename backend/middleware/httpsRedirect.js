module.exports = function httpsRedirect(req, res, next) {
  if (process.env.NODE_ENV !== "production" || process.env.FORCE_HTTPS !== "true") {
    return next();
  }

  const proto = req.headers["x-forwarded-proto"];
  if (proto === "https") return next();

  const host = req.headers.host;
  if (!host) return next();

  return res.redirect(301, `https://${host}${req.originalUrl}`);
};
