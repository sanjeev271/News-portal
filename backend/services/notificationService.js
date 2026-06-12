const Notification = require("../models/Notification");
const { emitNotification } = require("../socket/emitter");

async function createNotification(app, { user, type, title, message, link, meta }) {
  const notification = await Notification.create({
    user: user || null,
    type,
    title,
    message,
    link,
    meta,
  });

  const payload = notification.toObject();
  emitNotification(app, payload, user ? String(user) : null);
  return notification;
}

async function notifyUsers(app, userIds, data) {
  const results = [];
  for (const userId of userIds) {
    results.push(await createNotification(app, { ...data, user: userId }));
  }
  return results;
}

async function broadcastAnnouncement(app, { title, message, link }) {
  return createNotification(app, {
    type: "announcement",
    title,
    message,
    link,
  });
}

module.exports = {
  createNotification,
  notifyUsers,
  broadcastAnnouncement,
};
