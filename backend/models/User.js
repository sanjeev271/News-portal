const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "reporter", "user"],
      default: "user",
    },

    avatar: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    lastLogin: Date,

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },

    language: {
      type: String,
      default: "en",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
