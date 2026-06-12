const Article = require("../models/Article");
const User = require("../models/User");
const Comment = require("../models/Comment");
const LiveStream = require("../models/LiveStream");
const LiveEvent = require("../models/LiveEvent");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalReporters,
      totalArticles,
      publishedArticles,
      draftArticles,
      pendingArticles,
      breakingNews,
      totalViewsAgg,
      totalComments,
      activeStreams,
      activeLiveEvents,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "reporter" }),
      Article.countDocuments(),
      Article.countDocuments({ status: "published" }),
      Article.countDocuments({ status: "draft" }),
      Article.countDocuments({ status: "pending" }),
      Article.countDocuments({ isBreaking: true, status: "published" }),
      Article.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Comment.countDocuments({ isDeleted: false }),
      LiveStream.countDocuments({ status: "live" }),
      LiveEvent.countDocuments({ status: "live" }),
    ]);

    const latestActivity = await Article.find()
      .populate("author", "name")
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("title slug status updatedAt author");

    res.json({
      totalUsers,
      totalReporters,
      totalArticles,
      publishedArticles,
      drafts: draftArticles,
      pendingArticles,
      breakingNews,
      totalViews: totalViewsAgg[0]?.total || 0,
      totalComments,
      activeLiveStreams: activeStreams,
      activeLiveEvents,
      latestActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: "published" })
      .sort({ views: -1, likes: -1 })
      .limit(10)
      .populate("category")
      .populate("author", "name email");
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Article.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$category",
          totalArticles: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
