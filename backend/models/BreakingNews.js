const mongoose = require("mongoose");

const breakingNewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: String,
    link: String,
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
    priority: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    scheduledAt: Date,
    expiresAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

breakingNewsSchema.index({ isActive: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model("BreakingNews", breakingNewsSchema);
