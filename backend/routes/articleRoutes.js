const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { optionalArticleUpload } = require("../middleware/optionalUpload");

const {
  createArticle,
  getArticles,
  getAdminArticles,
  searchArticles,
  getTrending,
  getArticle,
  updateArticle,
  deleteArticle
} = require("../controllers/articleController");

router.get("/search", searchArticles);
router.get("/trending", getTrending);
router.get("/admin/all", auth, allowRoles("admin"), getAdminArticles);
router.get("/", getArticles);
router.get("/:slug", getArticle);

router.post("/", auth, allowRoles("admin"), optionalArticleUpload, createArticle);
router.put("/:id", auth, allowRoles("admin"), optionalArticleUpload, updateArticle);
router.delete("/:id", auth, allowRoles("admin"), deleteArticle);

module.exports = router;
