const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { optionalRecordingUpload } = require("../middleware/optionalUpload");
const {
  getActiveStream,
  getAllStreams,
  createStream,
  updateStream,
  uploadRecording,
  deleteStream
} = require("../controllers/liveStreamController");

router.get("/active", getActiveStream);
router.get("/", auth, allowRoles("admin"), getAllStreams);
router.post("/", auth, allowRoles("admin"), createStream);
router.put("/:id", auth, allowRoles("admin"), updateStream);
router.post("/:id/recording", auth, allowRoles("admin"), optionalRecordingUpload, uploadRecording);
router.delete("/:id", auth, allowRoles("admin"), deleteStream);

module.exports = router;
