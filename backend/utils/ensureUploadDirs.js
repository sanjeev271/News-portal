const fs = require("fs");
const path = require("path");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const SUBDIRS = ["news", "videos", "gallery"];

function ensureUploadDirs() {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  SUBDIRS.forEach((dir) => {
    fs.mkdirSync(path.join(UPLOAD_ROOT, dir), { recursive: true });
  });
  return UPLOAD_ROOT;
}

function resolveUploadPath(storedPath) {
  if (!storedPath || storedPath.startsWith("http")) return null;
  const clean = storedPath.replace(/\\/g, "/").replace(/^\//, "");
  const relative = clean.startsWith("uploads/") ? clean.slice("uploads/".length) : clean;
  return path.join(UPLOAD_ROOT, relative);
}

function uploadFileExists(storedPath) {
  const full = resolveUploadPath(storedPath);
  return full ? fs.existsSync(full) : false;
}

module.exports = { ensureUploadDirs, resolveUploadPath, uploadFileExists, UPLOAD_ROOT };
