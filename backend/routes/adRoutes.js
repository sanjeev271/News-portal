const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getActiveAds, getAllAds, createAd, updateAd, deleteAd } = require("../controllers/adController");

router.get("/", getActiveAds);
router.get("/admin", auth, allowRoles("admin"), getAllAds);
router.post("/", auth, allowRoles("admin"), upload.single("image"), createAd);
router.put("/:id", auth, allowRoles("admin"), upload.single("image"), updateAd);
router.delete("/:id", auth, allowRoles("admin"), deleteAd);

module.exports = router;
