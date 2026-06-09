const LiveStream = require("../models/LiveStream");

exports.getActiveStream = async (req, res) => {
  try {
    const stream = await LiveStream.findOne({ status: "live" }).sort({ startedAt: -1 });
    const latest = stream || await LiveStream.findOne({ status: "ended" }).sort({ endedAt: -1 });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStreams = async (req, res) => {
  try {
    res.json(await LiveStream.find().sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStream = async (req, res) => {
  try {
    const stream = await LiveStream.create(req.body);
    res.status(201).json(stream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    if (req.body.status === "live") {
      await LiveStream.updateMany(
        { _id: { $ne: stream._id }, status: "live" },
        { status: "ended", endedAt: new Date() }
      );
    }

    Object.assign(stream, req.body);
    if (req.body.status === "live" && !stream.startedAt) stream.startedAt = new Date();
    if (req.body.status === "ended") stream.endedAt = new Date();

    await stream.save();

    const io = req.app.get("io");
    const payload = stream.toObject ? stream.toObject() : stream;
    if (io) {
      io.emit("live_status", payload);
      if (stream.status === "live") {
        io.emit("push_notification", { title: "Live Now", message: stream.title });
      }
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
