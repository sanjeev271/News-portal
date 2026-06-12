const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const generateAccessToken = require("../utils/generateToken");
const {
  generateRefreshTokenValue,
  getRefreshExpiry,
} = require("../utils/generateToken");
const userFileStore = require("../utils/userFileStore");

async function issueTokens(user, req) {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshValue = generateRefreshTokenValue();

  await RefreshToken.create({
    user: user._id,
    token: refreshValue,
    expiresAt: getRefreshExpiry(),
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  return { accessToken, refreshToken: refreshValue };
}

function authResponse(user, tokens) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    theme: user.theme,
    language: user.language,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

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

    const tokens = await issueTokens(user, req);
    res.status(201).json(authResponse(user, tokens));
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

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = await issueTokens(user, req);
    res.json(authResponse(user, tokens));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const stored = await RefreshToken.findOne({ token: refreshToken, revokedAt: null });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(stored.user);
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    stored.revokedAt = new Date();
    await stored.save();

    const tokens = await issueTokens(user, req);
    res.json(authResponse(user, tokens));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.updateOne({ token: refreshToken }, { revokedAt: new Date() });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.json({
      ...user.toObject(),
      token: accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.language) user.language = req.body.language;
    if (req.body.theme) user.theme = req.body.theme;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
