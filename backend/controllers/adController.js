const Ad = require("../models/Ad");

exports.getActiveAds = async (req, res) => {
  try {
    const now = new Date();
    const filter = { active: true };
    if (req.query.placement) filter.placement = req.query.placement;

    const ads = await Ad.find({
      ...filter,
      $or: [{ startDate: null }, { startDate: { $lte: now } }],
      $and: [{ $or: [{ endDate: null }, { endDate: { $gte: now } }] }]
    });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAds = async (req, res) => {
  try {
    res.json(await Ad.find().sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const ad = await Ad.create({
      ...req.body,
      imageUrl: req.file ? req.file.path : req.body.imageUrl
    });
    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, {
      ...req.body,
      ...(req.file ? { imageUrl: req.file.path } : {})
    }, { new: true });
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: "Ad deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trackImpression = async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trackClick = async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
