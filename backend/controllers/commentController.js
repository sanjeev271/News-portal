const Comment = require("../models/Comment");
const { sanitizePlainText } = require("../utils/sanitizeHtml");

exports.addComment = async (req, res) => {
  try {
    const text = sanitizePlainText(req.body.text, 1000);
    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const comment = await Comment.create({
      article: req.body.article,
      user: req.user.id,
      text,
    });

    const populated = await Comment.findById(comment._id).populate("user", "name");

    const io = req.app.get("io");

    if (io) {
      io.emit("new_comment", populated);
    }

    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET COMMENTS OF ARTICLE
exports.getComments = async (req, res) => {
  try {

    const comments = await Comment.find({
      article: req.params.articleId
    })
    .populate("user", "name")
    .sort({ createdAt: -1 });

    res.json(comments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};