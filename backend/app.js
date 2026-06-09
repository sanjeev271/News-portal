const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { ensureUploadDirs, UPLOAD_ROOT } = require("./utils/ensureUploadDirs");

ensureUploadDirs();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", (req, res, next) => {
  const rel = req.path.replace(/^\/+/, "");
  const filePath = path.join(UPLOAD_ROOT, rel);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }
  next();
}, express.static(UPLOAD_ROOT));

app.use(
"/api/categories",
require(
"./routes/categoryRoutes"
)
);

app.use(
"/api/articles",
require(
"./routes/articleRoutes"
)
);

app.use("/api/comments", require("./routes/commentRoutes"));

app.use("/api/likes", require("./routes/likeRoutes"));

app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));
app.use("/api/ads", require("./routes/adRoutes"));
app.use("/api/live", require("./routes/liveStreamRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

app.get(
"/",
(req, res) => {

  res.json({
    message:
    "News Portal API Running"
  });

});

app.use(
"/api/auth",
require("./routes/authRoutes")
);

module.exports =
app;