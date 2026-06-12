const LiveStream = require("../models/LiveStream");
const { emitViewerCount } = require("./emitter");

const streamViewers = new Map();
const eventViewers = new Map();

function getStreamStats(streamId) {
  const room = streamViewers.get(String(streamId)) || new Set();
  return {
    streamId: String(streamId),
    current: room.size,
    unique: room.size,
  };
}

function setupSocketHandlers(io, app) {
  io.on("connection", (socket) => {
    socket.on("join_user_room", ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on("join_live_event", ({ slug }) => {
      if (!slug) return;
      const room = `live-event:${slug}`;
      socket.join(room);
      socket.data.liveEventSlug = slug;

      const viewers = eventViewers.get(slug) || new Set();
      viewers.add(socket.id);
      eventViewers.set(slug, viewers);
    });

    socket.on("leave_live_event", ({ slug }) => {
      if (!slug) return;
      socket.leave(`live-event:${slug}`);
      const viewers = eventViewers.get(slug);
      if (viewers) {
        viewers.delete(socket.id);
        if (!viewers.size) eventViewers.delete(slug);
      }
      delete socket.data.liveEventSlug;
    });

    socket.on("join_stream_viewers", async ({ streamId, userId }) => {
      if (!streamId) return;
      const sid = String(streamId);
      const room = `stream:${sid}`;
      socket.join(room);
      socket.data.viewerStreamId = sid;
      socket.data.viewerUserId = userId || null;

      const viewers = streamViewers.get(sid) || new Set();
      viewers.add(socket.id);
      streamViewers.set(sid, viewers);

      const current = viewers.size;
      try {
        const stream = await LiveStream.findById(sid);
        if (stream) {
          stream.viewerCount = current;
          if (current > stream.peakViewers) stream.peakViewers = current;
          stream.uniqueViewers = current;
          if (userId) stream.loggedViewers = Math.min(current, stream.loggedViewers + 1);
          await stream.save();
        }
      } catch {
        /* non-fatal */
      }

      emitViewerCount(app, {
        streamId: sid,
        current,
        peak: current,
        unique: current,
      });
    });

    socket.on("leave_stream_viewers", async ({ streamId }) => {
      if (!streamId) return;
      const sid = String(streamId);
      socket.leave(`stream:${sid}`);

      const viewers = streamViewers.get(sid);
      if (viewers) {
        viewers.delete(socket.id);
        if (!viewers.size) streamViewers.delete(sid);
      }

      const current = viewers?.size || 0;
      try {
        await LiveStream.findByIdAndUpdate(sid, { viewerCount: current });
      } catch {
        /* non-fatal */
      }

      emitViewerCount(app, { streamId: sid, current, peak: current, unique: current });
      delete socket.data.viewerStreamId;
    });

    socket.on("disconnect", async () => {
      if (socket.data.liveEventSlug) {
        const viewers = eventViewers.get(socket.data.liveEventSlug);
        if (viewers) {
          viewers.delete(socket.id);
          if (!viewers.size) eventViewers.delete(socket.data.liveEventSlug);
        }
      }

      if (socket.data.viewerStreamId) {
        const sid = socket.data.viewerStreamId;
        const viewers = streamViewers.get(sid);
        if (viewers) {
          viewers.delete(socket.id);
          if (!viewers.size) streamViewers.delete(sid);
        }
        const current = viewers?.size || 0;
        try {
          await LiveStream.findByIdAndUpdate(sid, { viewerCount: current });
        } catch {
          /* non-fatal */
        }
        emitViewerCount(app, { streamId: sid, current, peak: current, unique: current });
      }
    });
  });
}

module.exports = setupSocketHandlers;
