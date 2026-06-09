const express = require("express");
const router = express.Router();

const { likeArticle } = require("../controllers/likeController");

router.post("/:articleId", likeArticle);

module.exports = router;
