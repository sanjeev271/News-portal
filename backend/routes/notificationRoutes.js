const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getNotifications,
  markRead,
  markAllRead,
  getAdminNotifications,
  createAnnouncement,
} = require("../controllers/notificationController");

router.get("/admin/all", auth, allowRoles("admin"), getAdminNotifications);
router.post("/admin/announce", auth, allowRoles("admin"), createAnnouncement);
router.get("/", auth, getNotifications);
router.patch("/:id/read", auth, markRead);
router.patch("/read-all", auth, markAllRead);

module.exports = router;
