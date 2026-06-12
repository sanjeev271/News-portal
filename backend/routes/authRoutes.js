const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { validateBody } = require("../validators");
const {
  register,
  login,
  refresh,
  logout,
  profile,
  updateProfile,
} = require("../controllers/authController");

router.post(
  "/register",
  validateBody(["name", "email", "password"], {
    email: { type: "email" },
    password: { minLength: 6 },
    name: { minLength: 2, maxLength: 80 },
  }),
  register
);
router.post(
  "/login",
  validateBody(["email", "password"], { email: { type: "email" } }),
  login
);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", auth, profile);
router.put("/profile", auth, updateProfile);

module.exports = router;
