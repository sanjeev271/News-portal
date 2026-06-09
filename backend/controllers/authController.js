const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const userFileStore = require("../utils/userFileStore");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const fileUser = await userFileStore.findByEmail(email);
    if (fileUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const adminExists = await User.findOne({ role: "admin" });
    if (email === process.env.ADMIN_EMAIL || (adminExists && email === adminExists.email)) {
      return res.status(400).json({ message: "This email is reserved for the admin account" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    await userFileStore.upsertUser({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      const fileUser = await userFileStore.findByEmail(email);
      if (fileUser && (await userFileStore.verifyPassword(fileUser, password))) {
        user = await userFileStore.syncUserToMongo(User, fileUser);
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.profile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    ...user.toObject(),
    token: generateToken(user._id, user.role),
  });
};
