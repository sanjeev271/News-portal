const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  addComment,
  getComments,
  editComment,
  deleteComment,
  reportComment,
  moderateComment,
  getReportedComments,
  getAdminComments,
} = require("../controllers/commentController");

router.get("/admin/all", auth, allowRoles("admin"), getAdminComments);
router.get("/admin/reported", auth, allowRoles("admin"), getReportedComments);
router.post("/", auth, addComment);
router.put("/:id", auth, editComment);
router.delete("/:id", auth, deleteComment);
router.post("/:id/report", auth, reportComment);
router.patch("/:id/moderate", auth, allowRoles("admin"), moderateComment);
router.get("/:articleId", getComments);

module.exports = router;
