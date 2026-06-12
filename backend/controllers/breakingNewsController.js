const BreakingNews = require("../models/BreakingNews");
const { emitBreakingNews } = require("../socket/emitter");
const { createNotification } = require("../services/notificationService");

async function getActiveFilter() {
  const now = new Date();
  return {
    isActive: true,
    $or: [{ scheduledAt: null }, { scheduledAt: { $lte: now } }],
    $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }],
  };
}

exports.getActiveBreaking = async (req, res) => {
  try {
    const items = await BreakingNews.find(await getActiveFilter())
      .populate("article", "title slug")
      .sort({ isPinned: -1, priority: -1, createdAt: -1 })
      .limit(20);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBreaking = async (req, res) => {
  try {
    const items = await BreakingNews.find()
      .populate("article", "title slug")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBreaking = async (req, res) => {
  try {
    const item = await BreakingNews.create({
      title: req.body.title,
      message: req.body.message,
      link: req.body.link,
      article: req.body.article,
      priority: parseInt(req.body.priority, 10) || 0,
      isPinned: req.body.isPinned === true || req.body.isPinned === "true",
      isActive: req.body.isActive !== false && req.body.isActive !== "false",
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      createdBy: req.user.id,
    });

    if (item.isActive && (!item.scheduledAt || item.scheduledAt <= new Date())) {
      emitBreakingNews(req.app, item);
      await createNotification(req.app, {
        type: "breaking_news",
        title: item.title,
        message: item.message || item.title,
        link: item.link,
      });
    }

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBreaking = async (req, res) => {
  try {
    const item = await BreakingNews.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Breaking news not found" });

    ["title", "message", "link", "article", "isPinned", "isActive"].forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });
    if (req.body.priority !== undefined) item.priority = parseInt(req.body.priority, 10) || 0;
    if (req.body.scheduledAt !== undefined) item.scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    if (req.body.expiresAt !== undefined) item.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;

    await item.save();

    if (item.isActive) emitBreakingNews(req.app, item);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBreaking = async (req, res) => {
  try {
    await BreakingNews.findByIdAndDelete(req.params.id);
    res.json({ message: "Breaking news deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.activateBreaking = async (req, res) => {
  try {
    const item = await BreakingNews.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Breaking news not found" });
    emitBreakingNews(req.app, item);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deactivateBreaking = async (req, res) => {
  try {
    const item = await BreakingNews.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Breaking news not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
