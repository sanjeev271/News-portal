const Settings = require("../models/Settings");

const DEFAULT_SEO = {
  siteTitle: "News Portal",
  siteDescription: "Latest news, breaking stories and live updates",
  siteKeywords: "news, breaking, live",
  ogImage: ""
};

exports.getSEO = async (req, res) => {
  try {
    let setting = await Settings.findOne({ key: "seo" });
    if (!setting) {
      setting = await Settings.create({ key: "seo", value: DEFAULT_SEO });
    }
    res.json(setting.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSEO = async (req, res) => {
  try {
    const setting = await Settings.findOneAndUpdate(
      { key: "seo" },
      { value: req.body },
      { upsert: true, new: true }
    );
    res.json(setting.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
