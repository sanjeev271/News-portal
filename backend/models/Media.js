const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: String,
    url: { type: String, required: true },
    mimeType: String,
    size: Number,
    folder: { type: String, default: "general" },
    alt: String,
    caption: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

mediaSchema.index({ folder: 1, createdAt: -1 });
mediaSchema.index({ originalName: "text", alt: "text" });

module.exports = mongoose.model("Media", mediaSchema);
