const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true, lowercase: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    locale: { type: String, default: "en" },
    resultCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

searchLogSchema.index({ query: 1, createdAt: -1 });
searchLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SearchLog", searchLogSchema);
