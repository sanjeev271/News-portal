const Article = require("../models/Article");


// ===============================
// GET DASHBOARD STATS
// ===============================
exports.getDashboardStats = async (req, res) => {
  try {

    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: "published" });
    const breakingNews = await Article.countDocuments({ isBreaking: true });

    const totalViews = await Article.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);

    res.json({
      totalArticles,
      publishedArticles,
      breakingNews,
      totalViews: totalViews[0]?.total || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// GET TOP ARTICLES
// ===============================
exports.getTopArticles = async (req, res) => {
  try {

    const articles = await Article.find({ status: "published" })
      .sort({ views: -1 })
      .limit(5)
      .populate("category")
      .populate("author", "name email");

    res.json(articles);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// GET CATEGORY STATS
// ===============================
exports.getCategoryStats = async (req, res) => {
  try {

    const stats = await Article.aggregate([
      {
        $group: {
          _id: "$category",
          totalArticles: { $sum: 1 },
          totalViews: { $sum: "$views" }
        }
      }
    ]);

    res.json(stats);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};