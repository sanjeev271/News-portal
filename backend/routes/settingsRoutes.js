const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getSEO, updateSEO } = require("../controllers/settingsController");

router.get("/seo", getSEO);
router.put("/seo", auth, allowRoles("admin"), updateSEO);

module.exports = router;
