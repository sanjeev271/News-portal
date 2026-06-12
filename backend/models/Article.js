const mongoose = require("mongoose");

const revisionEntrySchema = new mongoose.Schema(
  {
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: String,
    note: String,
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    slug: String,
    summary: String,
    content: String,
    locale: { type: String, default: "en" },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "archived", "scheduled"],
      default: "draft",
    },
    rejectionReason: String,
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    mediaType: { type: String, enum: ["article", "video", "gallery"], default: "article" },

    featuredImage: String,
    videoUrl: String,
    gallery: [{ url: String, caption: String }],

    tags: [String],
    keywords: [String],

    seoTitle: String,
    seoDescription: String,

    scheduledAt: Date,
    publishedAt: Date,

    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    revisionHistory: [revisionEntrySchema],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

articleSchema.index({ title: "text", summary: "text", content: "text", tags: "text" });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ slug: 1 });

module.exports = mongoose.model("Article", articleSchema);
