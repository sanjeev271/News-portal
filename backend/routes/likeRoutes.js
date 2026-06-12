const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const {
  likeArticle,
  unlikeArticle,
  getLikeStatus,
} = require("../controllers/likeController");

router.get("/:articleId", optionalAuth, getLikeStatus);
router.post("/:articleId", auth, likeArticle);
router.delete("/:articleId", auth, unlikeArticle);

module.exports = router;
