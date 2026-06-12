const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { uploadLimiter } = require("../middleware/rateLimiter");
const { optionalArticleUpload } = require("../middleware/optionalUpload");

const {
  createArticle,
  getArticles,
  getAdminArticles,
  getPendingArticles,
  getReporterArticles,
  searchArticles,
  getTrending,
  getRelated,
  getByTag,
  getByAuthor,
  getArticle,
  updateArticle,
  submitForReview,
  approveArticle,
  rejectArticle,
  deleteArticle,
} = require("../controllers/articleController");

router.get("/search", searchArticles);
router.get("/trending", getTrending);
router.get("/admin/all", auth, allowRoles("admin"), getAdminArticles);
router.get("/admin/pending", auth, allowRoles("admin"), getPendingArticles);
router.get("/reporter/mine", auth, allowRoles("reporter", "admin"), getReporterArticles);
router.get("/related/:slug", getRelated);
router.get("/tag/:tag", getByTag);
router.get("/author/:authorId", getByAuthor);
router.get("/", getArticles);
router.get("/:slug", getArticle);

router.post("/", auth, allowRoles("admin", "reporter"), uploadLimiter, optionalArticleUpload, createArticle);
router.put("/:id", auth, allowRoles("admin", "reporter"), uploadLimiter, optionalArticleUpload, updateArticle);
router.patch("/:id/submit", auth, allowRoles("reporter", "admin"), submitForReview);
router.patch("/:id/approve", auth, allowRoles("admin"), approveArticle);
router.patch("/:id/reject", auth, allowRoles("admin"), rejectArticle);
router.delete("/:id", auth, allowRoles("admin", "reporter"), deleteArticle);

module.exports = router;
