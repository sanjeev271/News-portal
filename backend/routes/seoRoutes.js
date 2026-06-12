const express = require("express");
const router = express.Router();
const {
  getRobots,
  getRss,
  getSitemap,
  getNewsSitemap,
} = require("../controllers/seoController");

router.get("/robots.txt", getRobots);
router.get("/rss.xml", getRss);
router.get("/sitemap.xml", getSitemap);
router.get("/news-sitemap.xml", getNewsSitemap);

module.exports = router;
