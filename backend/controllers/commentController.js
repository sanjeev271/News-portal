const Comment = require("../models/Comment");
const { sanitizePlainText } = require("../utils/sanitizeHtml");
const { emitComment } = require("../socket/emitter");
const { createNotification } = require("../services/notificationService");

function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];

  comments.forEach((c) => {
    map.set(String(c._id), { ...c.toObject(), replies: [] });
  });

  map.forEach((node) => {
    if (node.parent && map.has(String(node.parent))) {
      map.get(String(node.parent)).replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

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
      parent: req.body.parent || null,
    });

    const populated = await Comment.findById(comment._id).populate("user", "name avatar");

    emitComment(req.app, populated);

    if (req.body.parent) {
      const parent = await Comment.findById(req.body.parent).populate("user");
      if (parent?.user) {
        await createNotification(req.app, {
          user: parent.user._id,
          type: "comment_reply",
          title: "New Reply",
          message: text.slice(0, 120),
          link: `/article/${req.body.articleSlug || ""}`,
        });
      }
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {
      article: req.params.articleId,
      moderationStatus: { $ne: "rejected" },
      isDeleted: false,
    };

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(filter),
    ]);

    res.json({
      comments: buildCommentTree(comments),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwner = String(comment.user) === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const text = sanitizePlainText(req.body.text, 1000);
    if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

    comment.text = text;
    comment.isEdited = true;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate("user", "name avatar");
    emitComment(req.app, populated);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = String(comment.user) === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (isAdmin) {
      await comment.deleteOne();
    } else {
      comment.isDeleted = true;
      comment.text = "[deleted]";
      await comment.save();
    }

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reportComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.reportCount += 1;
    if (req.body.reason) comment.reportReasons.push(req.body.reason);
    if (comment.reportCount >= 3) comment.moderationStatus = "reported";
    await comment.save();

    res.json({ message: "Comment reported" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.moderateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (req.body.moderationStatus) {
      comment.moderationStatus = req.body.moderationStatus;
    }
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminComments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (req.query.status) filter.moderationStatus = req.query.status;
    if (req.query.q) {
      filter.text = { $regex: req.query.q, $options: "i" };
    }

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate("user", "name email avatar")
        .populate("article", "title slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(filter),
    ]);

    res.json({ comments, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReportedComments = async (req, res) => {
  try {
    const comments = await Comment.find({ moderationStatus: "reported" })
      .populate("user", "name email")
      .populate("article", "title slug")
      .sort({ reportCount: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
