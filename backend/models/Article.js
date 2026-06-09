const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  summary: String,
  content: String,
  locale: { type: String, default: "en" },

  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  status: { type: String, default: "draft" },
  isBreaking: { type: Boolean, default: false },
  mediaType: { type: String, enum: ["article", "video", "gallery"], default: "article" },

  featuredImage: String,
  videoUrl: String,
  gallery: [{ url: String, caption: String }],

  seoTitle: String,
  seoDescription: String,
  keywords: [String],

  scheduledAt: Date,
  publishedAt: Date,

  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

articleSchema.index({ title: "text", summary: "text", content: "text" });

module.exports = mongoose.model("Article", articleSchema);
