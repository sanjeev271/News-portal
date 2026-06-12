const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    text: {
      type: String,
      required: true,
    },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    moderationStatus: {
      type: String,
      enum: ["approved", "pending", "rejected", "reported"],
      default: "approved",
    },
    reportCount: { type: Number, default: 0 },
    reportReasons: [String],
  },
  { timestamps: true }
);

commentSchema.index({ article: 1, parent: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
