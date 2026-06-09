const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getDashboardStats,
  getTopArticles,
  getCategoryStats
} = require("../controllers/analyticsController");


// ADMIN ONLY
router.get("/dashboard", auth, allowRoles("admin"), getDashboardStats);

router.get("/top-articles", auth, allowRoles("admin"), getTopArticles);

router.get("/categories", auth, allowRoles("admin"), getCategoryStats);

module.exports = router;