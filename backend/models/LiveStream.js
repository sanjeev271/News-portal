const mongoose = require("mongoose");

const liveStreamSchema = new mongoose.Schema({
  title: String,
  description: String,
  streamUrl: String,
  recordingUrl: String,
  streamType: { type: String, enum: ["url", "camera"], default: "url" },
  status: { type: String, enum: ["live", "scheduled", "ended"], default: "scheduled" },
  startedAt: Date,
  endedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("LiveStream", liveStreamSchema);
