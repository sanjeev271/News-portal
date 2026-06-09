require("dotenv").config();

const validateEnv = require("./utils/validateEnv");
validateEnv();

const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const setupLiveSignaling = require("./utils/liveSignaling");
const { getSocketCorsOptions } = require("./utils/corsConfig");

const server = http.createServer(app);

const io = new Server(server, {
  cors: getSocketCorsOptions(),
});

app.set("io", io);
setupLiveSignaling(io);

io.on("connection", (socket) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("User connected:", socket.id);
  }
  socket.on("disconnect", () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("User disconnected:", socket.id);
    }
  });
});

const seedAdmin = require("./utils/seedAdmin");
const seedNews = require("./utils/seedNews");
const startScheduler = require("./utils/scheduler");
const { ensureUploadDirs } = require("./utils/ensureUploadDirs");
const repairMissingUploads = require("./utils/repairMissingUploads");

ensureUploadDirs();

const isProd = process.env.NODE_ENV === "production";
const seedOnStart = process.env.SEED_ON_START === "true";

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await seedAdmin();

    if (!isProd || seedOnStart) {
      await seedNews().catch((err) => console.warn("News seed:", err.message));
    }

    if (!isProd) {
      await repairMissingUploads().catch((err) => console.warn("Upload repair:", err.message));
    }

    startScheduler(app);

    const port = process.env.PORT || 5000;
    server.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port} (${process.env.NODE_ENV || "development"})`);
    });
  })
  .catch((err) => {
    console.error("Startup failed:", err.message);
    process.exit(1);
  });
