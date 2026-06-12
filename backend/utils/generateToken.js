const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const REFRESH_EXPIRY_DAYS = parseInt(process.env.JWT_REFRESH_DAYS || "7", 10);

function generateAccessToken(userId, role) {
  return jwt.sign({ id: userId, role, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });
}

function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString("base64url");
}

function getRefreshExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_EXPIRY_DAYS);
  return d;
}

module.exports = generateAccessToken;
module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshTokenValue = generateRefreshTokenValue;
module.exports.getRefreshExpiry = getRefreshExpiry;
module.exports.ACCESS_EXPIRY = ACCESS_EXPIRY;
