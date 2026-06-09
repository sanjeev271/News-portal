function setupLiveSignaling(io) {
  io.on("connection", (socket) => {
    socket.on("join_live_room", async ({ streamId, role }) => {
      if (!streamId || !role) return;
      const room = `live:${String(streamId)}`;
      socket.join(room);
      socket.data.liveRoom = room;
      socket.data.liveRole = role;
      socket.data.streamId = String(streamId);

      const sockets = await io.in(room).fetchSockets();

      if (role === "viewer") {
        const broadcaster = sockets.find((s) => s.data.liveRole === "broadcaster" && s.id !== socket.id);
        if (broadcaster) {
          broadcaster.emit("viewer_joined", { viewerId: socket.id, streamId: String(streamId) });
        } else {
          socket.emit("broadcaster_waiting", { streamId: String(streamId) });
        }
      }

      if (role === "broadcaster") {
        io.to(room).emit("broadcaster_ready", { streamId: String(streamId) });
        for (const peer of sockets) {
          if (peer.id !== socket.id && peer.data.liveRole === "viewer") {
            socket.emit("viewer_joined", { viewerId: peer.id, streamId: String(streamId) });
          }
        }
      }
    });

    socket.on("viewer_ping", async ({ streamId }) => {
      if (!streamId) return;
      const room = `live:${String(streamId)}`;
      const sid = String(streamId);

      if (!socket.data.liveRoom || socket.data.liveRoom !== room) {
        socket.join(room);
        socket.data.liveRoom = room;
        socket.data.liveRole = "viewer";
        socket.data.streamId = sid;
      }

      const sockets = await io.in(room).fetchSockets();
      const broadcaster = sockets.find((s) => s.data.liveRole === "broadcaster");
      if (broadcaster) {
        broadcaster.emit("viewer_joined", { viewerId: socket.id, streamId: sid });
      } else {
        socket.emit("broadcaster_waiting", { streamId: sid });
      }
    });

    socket.on("webrtc_offer", ({ viewerId, offer }) => {
      if (!viewerId || !offer) return;
      io.to(viewerId).emit("webrtc_offer", { offer, broadcasterId: socket.id });
    });

    socket.on("webrtc_answer", ({ broadcasterId, answer }) => {
      if (!broadcasterId || !answer) return;
      io.to(broadcasterId).emit("webrtc_answer", { answer, viewerId: socket.id });
    });

    socket.on("webrtc_ice", ({ targetId, candidate }) => {
      if (!targetId || !candidate) return;
      io.to(targetId).emit("webrtc_ice", { candidate, fromId: socket.id });
    });

    socket.on("live_chunk", ({ streamId, chunk }) => {
      if (!streamId || !chunk) return;
      socket.to(`live:${String(streamId)}`).emit("live_chunk", {
        streamId: String(streamId),
        chunk,
      });
    });

    socket.on("leave_live_room", () => {
      if (socket.data.liveRoom) {
        socket.to(socket.data.liveRoom).emit("peer_left", { peerId: socket.id, role: socket.data.liveRole });
        socket.leave(socket.data.liveRoom);
      }
      delete socket.data.liveRoom;
      delete socket.data.liveRole;
      delete socket.data.streamId;
    });

    socket.on("disconnect", () => {
      if (socket.data.liveRoom) {
        socket.to(socket.data.liveRoom).emit("peer_left", { peerId: socket.id, role: socket.data.liveRole });
      }
    });
  });
}

module.exports = setupLiveSignaling;
