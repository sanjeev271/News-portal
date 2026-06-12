const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getActiveBreaking,
  getAllBreaking,
  createBreaking,
  updateBreaking,
  deleteBreaking,
  activateBreaking,
  deactivateBreaking,
} = require("../controllers/breakingNewsController");

router.get("/active", getActiveBreaking);
router.get("/", auth, allowRoles("admin"), getAllBreaking);
router.post("/", auth, allowRoles("admin"), createBreaking);
router.put("/:id", auth, allowRoles("admin"), updateBreaking);
router.delete("/:id", auth, allowRoles("admin"), deleteBreaking);
router.patch("/:id/activate", auth, allowRoles("admin"), activateBreaking);
router.patch("/:id/deactivate", auth, allowRoles("admin"), deactivateBreaking);

module.exports = router;
