const Bookmark = require("../models/Bookmark");

exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({ path: "article", populate: ["category", { path: "author", select: "name" }] })
      .sort({ createdAt: -1 });
    res.json(bookmarks.map((b) => b.article).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.create({ user: req.user.id, article: req.params.articleId });
    res.status(201).json(bookmark);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "Already bookmarked" });
    res.status(500).json({ message: error.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ user: req.user.id, article: req.params.articleId });
    res.json({ message: "Bookmark removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
