const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { uploadLimiter } = require("../middleware/rateLimiter");
const upload = require("../middleware/uploadMiddleware");
const {
  getLiveEvents,
  getLiveEvent,
  createLiveEvent,
  updateLiveEvent,
  deleteLiveEvent,
  getUpdates,
  addUpdate,
  updateLiveUpdate,
  deleteLiveUpdate,
} = require("../controllers/liveEventController");

const updateUpload = upload.fields([{ name: "images", maxCount: 10 }]);

router.get("/", getLiveEvents);
router.get("/:slug", getLiveEvent);
router.get("/:slug/updates", getUpdates);

router.post("/", auth, allowRoles("admin", "reporter"), createLiveEvent);
router.put("/:id", auth, allowRoles("admin", "reporter"), updateLiveEvent);
router.delete("/:id", auth, allowRoles("admin"), deleteLiveEvent);

router.post("/:slug/updates", auth, allowRoles("admin", "reporter"), uploadLimiter, updateUpload, addUpdate);
router.put("/:slug/updates/:updateId", auth, allowRoles("admin", "reporter"), updateLiveUpdate);
router.delete("/:slug/updates/:updateId", auth, allowRoles("admin", "reporter"), deleteLiveUpdate);

module.exports = router;
