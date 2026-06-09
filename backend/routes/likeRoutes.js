const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { likeArticle } = require("../controllers/likeController");

router.post("/:articleId", auth, likeArticle);

module.exports = router;
