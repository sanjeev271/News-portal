const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const USERS_EXAMPLE = path.join(DATA_DIR, "users.example.json");

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readRaw() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    if (fs.existsSync(USERS_EXAMPLE)) {
      fs.copyFileSync(USERS_EXAMPLE, USERS_FILE);
    } else {
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
    }
  }
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  return JSON.parse(raw);
}

function writeRaw(data) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function hashIfNeeded(password) {
  if (!password) return password;
  if (password.startsWith("$2a$") || password.startsWith("$2b$")) return password;
  return bcrypt.hash(password, 10);
}

async function normalizeUsers(users) {
  let changed = false;
  const normalized = [];
  for (const u of users) {
    const hashed = await hashIfNeeded(u.password);
    if (hashed !== u.password) changed = true;
    normalized.push({ ...u, password: hashed });
  }
  return { users: normalized, changed };
}

async function loadUsers() {
  const data = readRaw();
  const { users, changed } = await normalizeUsers(data.users || []);
  if (changed) writeRaw({ users });
  return users;
}

async function saveUsers(users) {
  writeRaw({ users });
}

async function findByEmail(email) {
  const users = await loadUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function verifyPassword(user, plainPassword) {
  return bcrypt.compare(plainPassword, user.password);
}

async function upsertUser({ name, email, password, role = "user" }) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  const hashed = await hashIfNeeded(password);
  const entry = { name, email: email.toLowerCase(), password: hashed, role };

  if (idx >= 0) {
    users[idx] = { ...users[idx], ...entry };
  } else {
    users.push(entry);
  }

  await saveUsers(users);
  return entry;
}

async function syncUserToMongo(User, fileUser) {
  let user = await User.findOne({ email: fileUser.email });
  if (!user) {
    user = await User.create({
      name: fileUser.name,
      email: fileUser.email,
      password: fileUser.password,
      role: fileUser.role,
    });
    return user;
  }

  user.name = fileUser.name;
  user.password = fileUser.password;
  user.role = fileUser.role;
  await user.save();
  return user;
}

async function seedUsersFromFile(User) {
  const users = await loadUsers();
  for (const fileUser of users) {
    await syncUserToMongo(User, fileUser);
  }
  console.log(`Synced ${users.length} user(s) from data/users.json`);
  return users;
}

module.exports = {
  USERS_FILE,
  loadUsers,
  saveUsers,
  findByEmail,
  verifyPassword,
  upsertUser,
  syncUserToMongo,
  seedUsersFromFile,
};
