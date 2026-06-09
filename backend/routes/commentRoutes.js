const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  addComment,
  getComments
} = require("../controllers/commentController");


// ADD COMMENT
router.post("/", auth, addComment);

// GET COMMENTS FOR ARTICLE
router.get("/:articleId", getComments);

module.exports = router;