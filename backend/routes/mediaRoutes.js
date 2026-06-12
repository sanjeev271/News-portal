const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { uploadLimiter } = require("../middleware/rateLimiter");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadMedia,
  getMedia,
  updateMedia,
  deleteMedia,
} = require("../controllers/mediaController");

const mediaUpload = upload.array("files", 10);

router.get("/", auth, allowRoles("admin", "reporter"), getMedia);
router.post("/", auth, allowRoles("admin", "reporter"), uploadLimiter, mediaUpload, uploadMedia);
router.put("/:id", auth, allowRoles("admin", "reporter"), uploadLimiter, upload.single("file"), updateMedia);
router.delete("/:id", auth, allowRoles("admin"), deleteMedia);

module.exports = router;
