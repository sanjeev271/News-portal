const Article = require("../models/Article");

exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.likes += 1;
    await article.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("article_liked", {
        articleId: article._id,
        likes: article.likes
      });
    }

    res.json({ likes: article.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
