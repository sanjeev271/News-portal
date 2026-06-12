const mongoose = require("mongoose");

const liveStreamSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    thumbnail: String,
    streamUrl: String,
    youtubeUrl: String,
    hlsUrl: String,
    iframeUrl: String,
    recordingUrl: String,
    streamType: {
      type: String,
      enum: ["url", "camera", "youtube", "hls", "iframe"],
      default: "url",
    },
    status: {
      type: String,
      enum: ["live", "scheduled", "ended"],
      default: "scheduled",
    },
    scheduledAt: Date,
    startedAt: Date,
    endedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    liveEvent: { type: mongoose.Schema.Types.ObjectId, ref: "LiveEvent" },
    viewerCount: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    uniqueViewers: { type: Number, default: 0 },
    loggedViewers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveStream", liveStreamSchema);
