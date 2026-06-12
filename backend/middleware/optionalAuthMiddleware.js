const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("role status");
    if (user && user.status === "active") {
      req.user = { id: user._id, role: user.role };
    }
  } catch {
    /* optional auth — ignore invalid tokens */
  }
  next();
};
