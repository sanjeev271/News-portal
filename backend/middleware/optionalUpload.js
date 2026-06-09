const upload = require("./uploadMiddleware");

const articleUpload = upload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

const recordingUpload = upload.single("recording");

function runUpload(middleware, req, res, next) {
  middleware(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Upload failed" });
    next();
  });
}

function optionalArticleUpload(req, res, next) {
  const type = req.headers["content-type"] || "";
  if (type.includes("multipart/form-data")) {
    return runUpload(articleUpload, req, res, next);
  }
  next();
}

function optionalRecordingUpload(req, res, next) {
  const type = req.headers["content-type"] || "";
  if (type.includes("multipart/form-data")) {
    return runUpload(recordingUpload, req, res, next);
  }
  next();
}

module.exports = { optionalArticleUpload, optionalRecordingUpload };
