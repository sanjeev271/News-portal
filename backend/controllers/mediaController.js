const Media = require("../models/Media");

const toUploadPath = (filePath) => {
  const p = filePath.replace(/\\/g, "/");
  return p.includes("/uploads/") ? p.slice(p.indexOf("uploads/")) : p;
};

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file && !req.files?.length) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const files = req.files || [req.file];
    const folder = req.body.folder || "general";
    const created = [];

    for (const file of files) {
      const media = await Media.create({
        filename: file.filename,
        originalName: file.originalname,
        url: toUploadPath(file.path),
        mimeType: file.mimetype,
        size: file.size,
        folder,
        alt: req.body.alt || "",
        caption: req.body.caption || "",
        uploadedBy: req.user.id,
      });
      created.push(media);
    }

    res.status(201).json(created.length === 1 ? created[0] : created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const filter = {};
    if (req.query.folder) filter.folder = req.query.folder;
    if (req.query.q) {
      filter.$or = [
        { originalName: { $regex: req.query.q, $options: "i" } },
        { alt: { $regex: req.query.q, $options: "i" } },
      ];
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Media.find(filter).populate("uploadedBy", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Media.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    ["alt", "caption", "folder", "metadata"].forEach((f) => {
      if (req.body[f] !== undefined) media[f] = req.body[f];
    });

    if (req.file) {
      media.filename = req.file.filename;
      media.url = toUploadPath(req.file.path);
      media.mimeType = req.file.mimetype;
      media.size = req.file.size;
    }

    await media.save();
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });
    await media.deleteOne();
    res.json({ message: "Media deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
