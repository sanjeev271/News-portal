const LiveEvent = require("../models/LiveEvent");
const LiveUpdate = require("../models/LiveUpdate");
const { uniqueSlug, populateOpts } = require("../services/liveEventService");
const {
  emitLiveStarted,
  emitLiveEnded,
  emitLiveUpdate,
} = require("../socket/emitter");
const { createNotification } = require("../services/notificationService");

exports.getLiveEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.live === "true") filter.status = "live";
    if (req.query.locale) filter.locale = req.query.locale;

    let events = await LiveEvent.find(filter)
      .populate(populateOpts)
      .sort({ status: 1, startedAt: -1, createdAt: -1 });

    if (!events.length && req.query.locale) {
      const fallbackFilter = { ...filter };
      delete fallbackFilter.locale;
      events = await LiveEvent.find(fallbackFilter)
        .populate(populateOpts)
        .sort({ status: 1, startedAt: -1, createdAt: -1 });
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLiveEvent = async (req, res) => {
  try {
    const event = await LiveEvent.findOne({ slug: req.params.slug }).populate(populateOpts);
    if (!event) return res.status(404).json({ message: "Live event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLiveEvent = async (req, res) => {
  try {
    const slug = await uniqueSlug(req.body.title);
    const event = await LiveEvent.create({
      title: req.body.title,
      slug,
      coverImage: req.body.coverImage,
      description: req.body.description,
      category: req.body.category,
      location: req.body.location,
      locale: req.body.locale === "en" ? "en" : "ne",
      status: req.body.status || "scheduled",
      liveStream: req.body.liveStream,
      isFeatured: req.body.isFeatured === true || req.body.isFeatured === "true",
      assignedReporters: req.body.assignedReporters || [],
      streamConfig: req.body.streamConfig || undefined,
      createdBy: req.user.id,
    });
    const populated = await LiveEvent.findById(event._id).populate(populateOpts);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLiveEvent = async (req, res) => {
  try {
    const event = await LiveEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Live event not found" });

    const prevStatus = event.status;
    ["title", "coverImage", "description", "category", "location", "status", "liveStream", "isFeatured", "assignedReporters", "streamConfig", "locale"].forEach((f) => {
      if (req.body[f] !== undefined) event[f] = req.body[f];
    });

    if (req.user.role === "reporter" && !canAccessLiveEvent(event, req.user)) {
      return res.status(403).json({ message: "Not assigned to this live event" });
    }

    if (req.body.status === "live" && prevStatus !== "live") {
      event.startedAt = new Date();
      await LiveEvent.updateMany(
        { _id: { $ne: event._id }, status: "live" },
        { status: "ended", endedAt: new Date() }
      );
    }
    if (req.body.status === "ended") event.endedAt = new Date();

    await event.save();
    const populated = await LiveEvent.findById(event._id).populate(populateOpts);

    if (populated.status === "live" && prevStatus !== "live") {
      emitLiveStarted(req.app, populated);
      await createNotification(req.app, {
        type: "live_started",
        title: "Live Coverage Started",
        message: populated.title,
        link: `/live-event/${populated.slug}`,
      });
    }
    if (populated.status === "ended" && prevStatus === "live") {
      emitLiveEnded(req.app, populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLiveEvent = async (req, res) => {
  try {
    const event = await LiveEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Live event not found" });
    await LiveUpdate.deleteMany({ liveEvent: event._id });
    await event.deleteOne();
    res.json({ message: "Live event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUpdates = async (req, res) => {
  try {
    const event = await LiveEvent.findOne({ slug: req.params.slug });
    if (!event) return res.status(404).json({ message: "Live event not found" });

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { liveEvent: event._id };
    if (req.query.locale) filter.locale = req.query.locale;

    const runQuery = () =>
      Promise.all([
        LiveUpdate.find(filter)
          .populate("author", "name avatar role")
          .sort({ isPinned: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LiveUpdate.countDocuments(filter),
      ]);

    let [updates, total] = await runQuery();

    if (!updates.length && req.query.locale) {
      const fallbackFilter = { liveEvent: event._id };
      [updates, total] = await Promise.all([
        LiveUpdate.find(fallbackFilter)
          .populate("author", "name avatar role")
          .sort({ isPinned: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LiveUpdate.countDocuments(fallbackFilter),
      ]);
    }

    res.json({ updates, total, page, pages: Math.ceil(total / limit), hasMore: skip + updates.length < total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function canAccessLiveEvent(event, user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "reporter") return false;
  if (String(event.createdBy) === user.id) return true;
  return (event.assignedReporters || []).some((r) => String(r._id || r) === user.id);
}

function detectUpdateType(body) {
  if (body.isBreaking) return "breaking";
  if (body.officialStatement) return "official_statement";
  if (body.youtubeUrl) return "youtube";
  if (body.videoUrl) return "video";
  if (body.quote) return "quote";
  if (body.images?.length > 1) return "gallery";
  if (body.images?.length) return "image";
  return "text";
}

exports.addUpdate = async (req, res) => {
  try {
    const event = await LiveEvent.findOne({ slug: req.params.slug });
    if (!event) return res.status(404).json({ message: "Live event not found" });

    if (req.user.role === "reporter" && !canAccessLiveEvent(event, req.user)) {
      return res.status(403).json({ message: "Not assigned to this live event" });
    }

    const toUploadPath = (filePath) => {
      const p = filePath.replace(/\\/g, "/");
      return p.includes("/uploads/") ? p.slice(p.indexOf("uploads/")) : p;
    };

    const images = [];
    const imageCaption = req.body.imageCaption || "";
    if (req.files?.images) {
      req.files.images.forEach((f) => images.push({ url: toUploadPath(f.path), caption: imageCaption }));
    }
    if (req.body.images && typeof req.body.images === "string") {
      try {
        const parsed = JSON.parse(req.body.images);
        if (Array.isArray(parsed)) images.push(...parsed);
      } catch {
        /* ignore */
      }
    }

    const update = await LiveUpdate.create({
      liveEvent: event._id,
      title: req.body.title || "",
      text: req.body.text || "",
      images,
      videoUrl: req.body.videoUrl,
      youtubeUrl: req.body.youtubeUrl,
      quote: req.body.quote,
      officialStatement: req.body.officialStatement || "",
      isBreaking: req.body.isBreaking === true || req.body.isBreaking === "true",
      isPinned: req.body.isPinned === true || req.body.isPinned === "true",
      location: req.body.location,
      locale: req.body.locale === "en" ? "en" : "ne",
      author: req.user.id,
      updateType: detectUpdateType({ ...req.body, images }),
    });

    const populated = await LiveUpdate.findById(update._id).populate("author", "name avatar role");
    emitLiveUpdate(req.app, "added", populated.toObject(), event.slug);

    if (event.status !== "live") {
      event.status = "live";
      if (!event.startedAt) event.startedAt = new Date();
      await event.save();
      const fullEvent = await LiveEvent.findById(event._id).populate(populateOpts);
      emitLiveStarted(req.app, fullEvent);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLiveUpdate = async (req, res) => {
  try {
    const update = await LiveUpdate.findById(req.params.updateId).populate("liveEvent");
    if (!update) return res.status(404).json({ message: "Update not found" });

    const isOwner = String(update.author) === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to edit this update" });
    }

    ["title", "text", "videoUrl", "youtubeUrl", "quote", "officialStatement", "location", "locale"].forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });
    if (req.body.isBreaking !== undefined) update.isBreaking = req.body.isBreaking === true || req.body.isBreaking === "true";
    if (req.body.isPinned !== undefined && isAdmin) update.isPinned = req.body.isPinned === true || req.body.isPinned === "true";

    update.isEdited = true;
    update.editedAt = new Date();
    update.updateType = detectUpdateType({
      ...update.toObject(),
      ...req.body,
      images: update.images,
    });

    await update.save();
    const populated = await LiveUpdate.findById(update._id).populate("author", "name avatar role");
    const slug = update.liveEvent?.slug;
    emitLiveUpdate(req.app, "updated", populated.toObject(), slug);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLiveUpdate = async (req, res) => {
  try {
    const update = await LiveUpdate.findById(req.params.updateId).populate("liveEvent");
    if (!update) return res.status(404).json({ message: "Update not found" });

    const isOwner = String(update.author) === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this update" });
    }

    const slug = update.liveEvent?.slug;
    const payload = update.toObject();
    await update.deleteOne();
    emitLiveUpdate(req.app, "deleted", payload, slug);
    res.json({ message: "Update deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
