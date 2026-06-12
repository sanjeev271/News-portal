const LiveStream = require("../models/LiveStream");
const { emitLiveStatus } = require("../socket/emitter");
const { createNotification } = require("../services/notificationService");

function resolveStreamType(body) {
  if (body.streamType === "camera") return "camera";
  if (body.youtubeUrl) return "youtube";
  if (body.hlsUrl) return "hls";
  if (body.iframeUrl) return "iframe";
  return "url";
}

exports.getActiveStream = async (req, res) => {
  try {
    const live = await LiveStream.findOne({ status: "live" }).sort({ startedAt: -1 }).populate("createdBy", "name avatar");
    if (live) return res.json(live);

    const scheduled = await LiveStream.findOne({ status: "scheduled" }).sort({ scheduledAt: 1, createdAt: -1 });
    if (scheduled) return res.json(scheduled);

    const ended = await LiveStream.findOne({ status: "ended" }).sort({ endedAt: -1 });
    res.json(ended);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStreams = async (req, res) => {
  try {
    res.json(await LiveStream.find().populate("createdBy", "name avatar").sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStream = async (req, res) => {
  try {
    const streamType = resolveStreamType(req.body);
    const stream = await LiveStream.create({
      title: req.body.title,
      description: req.body.description,
      thumbnail: req.body.thumbnail,
      streamType,
      streamUrl: streamType === "url" ? (req.body.streamUrl || "").trim() : "",
      youtubeUrl: (req.body.youtubeUrl || "").trim(),
      hlsUrl: (req.body.hlsUrl || "").trim(),
      iframeUrl: (req.body.iframeUrl || "").trim(),
      recordingUrl: (req.body.recordingUrl || "").trim(),
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
      liveEvent: req.body.liveEvent,
      status: "scheduled",
      createdBy: req.user.id,
    });
    res.status(201).json(stream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    if (req.user.role === "reporter" && String(stream.createdBy) !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.body.status === "live") {
      await LiveStream.updateMany(
        { _id: { $ne: stream._id }, status: "live" },
        { status: "ended", endedAt: new Date() }
      );
    }

    ["title", "description", "thumbnail", "streamUrl", "youtubeUrl", "hlsUrl", "iframeUrl", "recordingUrl", "status", "liveEvent"].forEach((f) => {
      if (req.body[f] !== undefined) stream[f] = req.body[f];
    });

    if (req.body.streamType) stream.streamType = resolveStreamType(req.body);
    if (req.body.scheduledAt) stream.scheduledAt = new Date(req.body.scheduledAt);

    if (req.body.status === "live") {
      if (!stream.startedAt) stream.startedAt = new Date();
      if (stream.streamType === "camera") stream.streamUrl = "";
    }

    if (req.body.status === "ended") stream.endedAt = new Date();

    await stream.save();
    const payload = stream.toObject();

    emitLiveStatus(req.app, payload);

    if (stream.status === "live") {
      await createNotification(req.app, {
        type: "live_started",
        title: "Live Now",
        message: stream.title,
        link: "/live",
      });
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadRecording = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });
    if (!req.file) return res.status(400).json({ message: "No recording file provided" });

    const p = req.file.path.replace(/\\/g, "/");
    stream.recordingUrl = p.includes("/uploads/") ? p.slice(p.indexOf("uploads/")) : p;
    await stream.save();

    emitLiveStatus(req.app, stream.toObject());
    res.json(stream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStream = async (req, res) => {
  try {
    await LiveStream.findByIdAndDelete(req.params.id);
    res.json({ message: "Stream deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
