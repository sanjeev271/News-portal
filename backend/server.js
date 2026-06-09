const http = require("http");
const app = require("./app");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const setupLiveSignaling = require("./utils/liveSignaling");
require("dotenv").config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.set("io", io);
setupLiveSignaling(io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});
const seedAdmin = require("./utils/seedAdmin");
const seedNews = require("./utils/seedNews");
const startScheduler = require("./utils/scheduler");
const { ensureUploadDirs } = require("./utils/ensureUploadDirs");
const repairMissingUploads = require("./utils/repairMissingUploads");

ensureUploadDirs();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await seedAdmin();
    await seedNews().catch((err) => console.warn("News seed:", err.message));
    await repairMissingUploads().catch((err) => console.warn("Upload repair:", err.message));
    startScheduler(app);

    const port = process.env.PORT || 5000;
    server.listen(port, "0.0.0.0", () => {
      console.log("Server running on port", port);
    });
  })
  .catch((err) => console.log(err));