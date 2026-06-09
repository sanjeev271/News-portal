const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReporters = async (req, res) => {
  try {
    const reporters = await User.find({ role: { $in: ["reporter", "editor"] } }).select("-password");
    res.json(reporters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin" && req.body.role && req.body.role !== "admin") {
      return res.status(403).json({ message: "Cannot change admin role" });
    }

    if (req.body.role && req.body.role === "admin") {
      const adminExists = await User.findOne({ role: "admin", _id: { $ne: user._id } });
      if (adminExists) return res.status(400).json({ message: "Only one admin allowed" });
    }

    if (req.body.role) user.role = req.body.role;
    if (req.body.status) user.status = req.body.status;
    if (req.body.name) user.name = req.body.name;

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot delete admin" });
    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.theme) user.theme = req.body.theme;
    if (req.body.language) user.language = req.body.language;
    await user.save();
    res.json({ theme: user.theme, language: user.language });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
