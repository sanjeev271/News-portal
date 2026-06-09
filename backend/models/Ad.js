const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  title: String,
  placement: { type: String, enum: ["header", "sidebar", "footer", "inline"], default: "sidebar" },
  imageUrl: String,
  link: String,
  active: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

module.exports = mongoose.model("Ad", adSchema);
