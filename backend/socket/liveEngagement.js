const MAX_CHAT = 200;
const MAX_QA = 100;

const liveChatRooms = new Map();
const liveReactionVoters = new Map();
const livePolls = new Map();
const liveQA = new Map();

function roomKey(id) {
  return String(id);
}

function getChat(roomId) {
  const key = roomKey(roomId);
  if (!liveChatRooms.has(key)) liveChatRooms.set(key, []);
  return liveChatRooms.get(key);
}

function getReactionCounts(roomId) {
  const voters = liveReactionVoters.get(roomKey(roomId)) || new Map();
  const counts = {};
  voters.forEach((emoji) => {
    counts[emoji] = (counts[emoji] || 0) + 1;
  });
  return counts;
}

function getUserReaction(roomId, voterKey) {
  const voters = liveReactionVoters.get(roomKey(roomId));
  return voters?.get(voterKey) || null;
}

function getPolls(roomId) {
  const key = roomKey(roomId);
  if (!livePolls.has(key)) {
    livePolls.set(key, [
      {
        id: "default",
        question: "What matters most in this coverage?",
        options: [
          { id: "a", text: "Breaking updates", votes: 0 },
          { id: "b", text: "Expert analysis", votes: 0 },
          { id: "c", text: "On-ground reporting", votes: 0 },
        ],
        voters: new Set(),
      },
    ]);
  }
  return livePolls.get(key);
}

function getQA(roomId) {
  const key = roomKey(roomId);
  if (!liveQA.has(key)) liveQA.set(key, []);
  return liveQA.get(key);
}

function setupLiveEngagement(io) {
  io.on("connection", (socket) => {
    socket.on("join_live_engagement", ({ roomId, userId }) => {
      if (!roomId) return;
      const room = `live-engage:${roomId}`;
      socket.join(room);
      socket.data.engageRoom = roomId;
      socket.data.engageVoterKey = userId || socket.id;

      const voterKey = socket.data.engageVoterKey;
      const chat = getChat(roomId).slice(-50);
      const polls = getPolls(roomId).map((p) => ({
        id: p.id,
        question: p.question,
        options: p.options.map((o) => ({ id: o.id, text: o.text, votes: o.votes })),
      }));

      socket.emit("live_engagement_state", {
        chat,
        polls,
        qa: getQA(roomId).slice(-30),
        reactions: getReactionCounts(roomId),
        userReaction: getUserReaction(roomId, voterKey),
      });
    });

    socket.on("leave_live_engagement", ({ roomId }) => {
      if (!roomId) return;
      socket.leave(`live-engage:${roomId}`);
      delete socket.data.engageRoom;
      delete socket.data.engageVoterKey;
    });

    socket.on("live_chat_send", ({ roomId, message, user }) => {
      if (!roomId || !message?.trim()) return;
      const text = message.trim().slice(0, 500);
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        user: user?.name || "Viewer",
        userId: user?.id || null,
        at: new Date().toISOString(),
      };
      const chat = getChat(roomId);
      chat.push(entry);
      if (chat.length > MAX_CHAT) chat.splice(0, chat.length - MAX_CHAT);
      io.to(`live-engage:${roomId}`).emit("live_chat_message", entry);
    });

    socket.on("live_reaction", ({ roomId, emoji, userId }) => {
      if (!roomId || !emoji) return;
      const key = roomKey(roomId);
      if (!liveReactionVoters.has(key)) liveReactionVoters.set(key, new Map());
      const voters = liveReactionVoters.get(key);
      const voterKey = userId || socket.data.engageVoterKey || socket.id;

      const previous = voters.get(voterKey);
      if (previous === emoji) return;

      voters.set(voterKey, emoji);
      const counts = getReactionCounts(roomId);

      io.to(`live-engage:${roomId}`).emit("live_reaction_burst", {
        emoji,
        counts,
        userReaction: emoji,
        voterKey,
      });
    });

    socket.on("live_poll_vote", ({ roomId, pollId, optionId, voterId }) => {
      if (!roomId || !pollId || !optionId) return;
      const polls = getPolls(roomId);
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) return;
      const voterKey = voterId || socket.data.engageVoterKey || socket.id;
      if (poll.voters.has(voterKey)) return;
      poll.voters.add(voterKey);
      const opt = poll.options.find((o) => o.id === optionId);
      if (opt) opt.votes += 1;
      io.to(`live-engage:${roomId}`).emit("live_poll_updated", {
        pollId,
        options: poll.options.map((o) => ({ id: o.id, text: o.text, votes: o.votes })),
      });
    });

    socket.on("live_qa_submit", ({ roomId, question, user }) => {
      if (!roomId || !question?.trim()) return;
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        question: question.trim().slice(0, 300),
        user: user?.name || "Viewer",
        at: new Date().toISOString(),
        answered: false,
      };
      const qa = getQA(roomId);
      qa.push(entry);
      if (qa.length > MAX_QA) qa.splice(0, qa.length - MAX_QA);
      io.to(`live-engage:${roomId}`).emit("live_qa_added", entry);
    });
  });
}

module.exports = setupLiveEngagement;
