const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getUsers,
  getReporters,
  updateUser,
  deleteUser,
  updatePreferences
} = require("../controllers/userController");

router.patch("/preferences", auth, updatePreferences);
router.get("/reporters", auth, allowRoles("admin"), getReporters);
router.get("/", auth, allowRoles("admin"), getUsers);
router.put("/:id", auth, allowRoles("admin"), updateUser);
router.delete("/:id", auth, allowRoles("admin"), deleteUser);

module.exports = router;
