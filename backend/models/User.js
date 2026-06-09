const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: [
        "admin",
        "editor",
        "reporter",
        "user"
      ],
      default: "user"
    },

    avatar: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      default: "active"
    },

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    },

    language: {
      type: String,
      default: "en"
    }
  },
  {
    timestamps: true
  }
);

module.exports =
mongoose.model(
  "User",
  userSchema
);