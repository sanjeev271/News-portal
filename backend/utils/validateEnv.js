const crypto = require("crypto");

const WEAK_SECRETS = new Set([
  "supersecretnewsportalkey",
  "change-this-to-a-long-random-secret",
  "your-super-secret-jwt-key",
  "secret",
  "jwt_secret",
]);

const WEAK_PASSWORDS = new Set(["admin123", "password", "123456"]);

function generateSecretHint() {
  return crypto.randomBytes(48).toString("base64url");
}

function validateEnv() {
  const isProd = process.env.NODE_ENV === "production";
  const errors = [];
  const warnings = [];

  if (!process.env.MONGO_URI) {
    errors.push("MONGO_URI is required");
  }

  const jwt = process.env.JWT_SECRET || "";
  if (!jwt) {
    errors.push("JWT_SECRET is required");
  } else if (isProd && jwt.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters in production");
  } else if (isProd && WEAK_SECRETS.has(jwt.toLowerCase())) {
    errors.push("JWT_SECRET is a known weak default — generate a strong random secret");
  } else if (!isProd && jwt.length < 32) {
    warnings.push("JWT_SECRET should be at least 32 characters");
  }

  if (isProd) {
    const origins = (process.env.CORS_ORIGINS || "").trim();
    if (!origins) {
      errors.push("CORS_ORIGINS is required in production (comma-separated frontend URLs)");
    }

    const adminPass = process.env.ADMIN_PASSWORD || "";
    if (WEAK_PASSWORDS.has(adminPass)) {
      errors.push("ADMIN_PASSWORD is too weak for production");
    }

    if (process.env.FORCE_HTTPS !== "true") {
      warnings.push("Set FORCE_HTTPS=true when behind an HTTPS reverse proxy");
    }
  } else if (!process.env.JWT_SECRET || jwt.length < 32) {
    warnings.push(`Dev tip: set a strong JWT_SECRET (e.g. ${generateSecretHint()})`);
  }

  warnings.forEach((msg) => console.warn("[env]", msg));

  if (errors.length) {
    console.error("\nEnvironment validation failed:\n");
    errors.forEach((e) => console.error("  -", e));
    console.error("\nGenerate a secret: node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"\n");
    process.exit(1);
  }
}

module.exports = validateEnv;
