const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No Token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("role status");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({ message: "Account inactive" });
    }

    req.user = { id: decoded.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid Token" });
  }
};