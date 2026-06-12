const Article = require("../models/Article");
const Like = require("../models/Like");
const { emitLikeUpdated } = require("../socket/emitter");

exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const existing = await Like.findOne({ user: req.user.id, article: article._id });
    if (existing) {
      return res.json({ likes: article.likes, liked: true });
    }

    await Like.create({ user: req.user.id, article: article._id });
    article.likes += 1;
    await article.save();

    emitLikeUpdated(req.app, {
      articleId: article._id,
      likes: article.likes,
      liked: true,
    });

    res.json({ likes: article.likes, liked: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unlikeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const removed = await Like.findOneAndDelete({ user: req.user.id, article: article._id });
    if (removed) {
      article.likes = Math.max(0, article.likes - 1);
      await article.save();
    }

    emitLikeUpdated(req.app, {
      articleId: article._id,
      likes: article.likes,
      liked: false,
    });

    res.json({ likes: article.likes, liked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLikeStatus = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId).select("likes");
    if (!article) return res.status(404).json({ message: "Article not found" });

    let liked = false;
    if (req.user) {
      liked = !!(await Like.findOne({ user: req.user.id, article: article._id }));
    }

    res.json({ likes: article.likes, liked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
