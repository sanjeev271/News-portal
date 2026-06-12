const mongoose = require("mongoose");

const liveEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    coverImage: String,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    location: String,
    locale: { type: String, enum: ["en", "ne"], default: "ne" },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },
    startedAt: Date,
    endedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    liveStream: { type: mongoose.Schema.Types.ObjectId, ref: "LiveStream" },
    isFeatured: { type: Boolean, default: false },
    assignedReporters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    streamConfig: {
      type: {
        type: String,
        enum: ["webrtc", "youtube", "hls", "iframe", "none"],
        default: "none",
      },
      url: String,
      embedUrl: String,
      youtubeId: String,
    },
  },
  { timestamps: true }
);

liveEventSchema.index({ status: 1, startedAt: -1 });
liveEventSchema.index({ assignedReporters: 1 });

module.exports = mongoose.model("LiveEvent", liveEventSchema);
