const express = require("express");
const router = express.Router();
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const auth = require("../middleware/authMiddleware");
const {
  search,
  autocomplete,
  trending,
  recent,
  searchArticles,
} = require("../controllers/searchController");

router.get("/", optionalAuth, search);
router.get("/autocomplete", autocomplete);
router.get("/trending", trending);
router.get("/recent", auth, recent);
router.get("/articles", searchArticles);

module.exports = router;
