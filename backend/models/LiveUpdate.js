const mongoose = require("mongoose");

const liveUpdateSchema = new mongoose.Schema(
  {
    liveEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveEvent",
      required: true,
      index: true,
    },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
    images: [{ url: String, caption: String }],
    videoUrl: String,
    youtubeUrl: String,
    quote: String,
    officialStatement: String,
    isBreaking: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
    location: String,
    locale: { type: String, enum: ["en", "ne"], default: "ne" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updateType: {
      type: String,
      enum: ["text", "image", "gallery", "video", "youtube", "quote", "official_statement", "breaking"],
      default: "text",
    },
  },
  { timestamps: true }
);

liveUpdateSchema.index({ liveEvent: 1, createdAt: -1 });

module.exports = mongoose.model("LiveUpdate", liveUpdateSchema);
