const User = require("../models/User");
const userFileStore = require("./userFileStore");

async function seedAdmin() {
  await userFileStore.seedUsersFromFile(User);
  const admin = await User.findOne({ role: "admin" });
  if (admin) {
    console.log("Admin ready:", admin.email, "(credentials in backend/data/users.json)");
  }
  return admin;
}

module.exports = seedAdmin;
