const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: {
      type: String,
      enum: [
        "breaking_news",
        "live_started",
        "live_ended",
        "article_published",
        "comment_reply",
        "announcement",
        "article_approved",
        "article_rejected",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: String,
    link: String,
    isRead: { type: Boolean, default: false },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
