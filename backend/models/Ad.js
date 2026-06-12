const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    title: String,
    placement: {
      type: String,
      enum: ["header", "sidebar", "footer", "inline", "popup"],
      default: "sidebar",
    },
    imageUrl: String,
    link: String,
    active: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", adSchema);
