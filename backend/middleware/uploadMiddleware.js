const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { UPLOAD_ROOT } = require("../utils/ensureUploadDirs");

["news", "videos", "gallery"].forEach((dir) => {
  fs.mkdirSync(path.join(UPLOAD_ROOT, dir), { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video" || file.fieldname === "recording") {
      return cb(null, path.join(UPLOAD_ROOT, "videos"));
    }
    if (file.fieldname === "gallery") {
      return cb(null, path.join(UPLOAD_ROOT, "gallery"));
    }
    cb(null, path.join(UPLOAD_ROOT, "news"));
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video" || file.fieldname === "recording") {
    return file.mimetype.startsWith("video/")
      ? cb(null, true)
      : cb(new Error("Only video files allowed"), false);
  }
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image files allowed"), false);
};

const upload = multer({ storage, fileFilter });

upload.toPublicPath = (absolutePath) => {
  if (!absolutePath) return null;
  const normalized = absolutePath.replace(/\\/g, "/");
  const idx = normalized.indexOf("/uploads/");
  if (idx >= 0) return normalized.slice(idx + 1);
  if (normalized.startsWith("uploads/")) return normalized;
  const rel = path.relative(UPLOAD_ROOT, absolutePath).replace(/\\/g, "/");
  return `uploads/${rel}`;
};

module.exports = upload;
