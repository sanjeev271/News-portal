const EVENTS = {
  LIVE_STARTED: "live_started",
  LIVE_ENDED: "live_ended",
  LIVE_UPDATE_ADDED: "live_update_added",
  LIVE_UPDATE_UPDATED: "live_update_updated",
  LIVE_UPDATE_DELETED: "live_update_deleted",
  ARTICLE_PUBLISHED: "article_published",
  ARTICLE_UPDATED: "article_updated",
  BREAKING_NEWS: "breaking_news",
  NOTIFICATION: "notification",
  COMMENT_ADDED: "comment_added",
  LIKE_UPDATED: "like_updated",
  VIEWER_COUNT: "viewer_count",
  // Legacy aliases for backward compatibility
  NEW_ARTICLE: "new_article",
  NEW_COMMENT: "new_comment",
  LIVE_STATUS: "live_status",
  PUSH_NOTIFICATION: "push_notification",
};

function getIo(app) {
  return app?.get?.("io") || null;
}

function emit(io, event, payload, room) {
  if (!io) return;
  if (room) {
    io.to(room).emit(event, payload);
  } else {
    io.emit(event, payload);
  }
}

function emitArticlePublished(app, article) {
  const io = getIo(app);
  if (!io || article.status !== "published") return;
  emit(io, EVENTS.ARTICLE_PUBLISHED, article);
  emit(io, EVENTS.NEW_ARTICLE, article);
  if (article.isBreaking) {
    emit(io, EVENTS.BREAKING_NEWS, {
      title: article.title,
      message: article.summary || article.title,
      link: `/article/${article.slug}`,
      articleId: article._id,
    });
  }
}

function emitArticleUpdated(app, article) {
  const io = getIo(app);
  if (!io) return;
  emit(io, EVENTS.ARTICLE_UPDATED, article);
  if (article.status === "published") {
    emit(io, EVENTS.NEW_ARTICLE, article);
  }
}

function emitBreakingNews(app, item) {
  const io = getIo(app);
  if (!io) return;
  emit(io, EVENTS.BREAKING_NEWS, item);
  emit(io, EVENTS.PUSH_NOTIFICATION, {
    title: "Breaking News",
    message: item.title || item.message,
    link: item.link,
    isBreaking: true,
  });
}

function emitLiveStarted(app, event) {
  const io = getIo(app);
  if (!io) return;
  emit(io, EVENTS.LIVE_STARTED, event);
  emit(io, EVENTS.PUSH_NOTIFICATION, {
    title: "Live Coverage",
    message: event.title,
    link: `/live-event/${event.slug}`,
  });
}

function emitLiveEnded(app, event) {
  const io = getIo(app);
  if (!io) return;
  emit(io, EVENTS.LIVE_ENDED, event);
}

function emitLiveUpdate(app, action, update, eventSlug) {
  const io = getIo(app);
  if (!io) return;
  const room = eventSlug ? `live-event:${eventSlug}` : null;
  const eventMap = {
    added: EVENTS.LIVE_UPDATE_ADDED,
    updated: EVENTS.LIVE_UPDATE_UPDATED,
    deleted: EVENTS.LIVE_UPDATE_DELETED,
  };
  const payload = { ...update, eventSlug };
  emit(io, eventMap[action], payload, room);
  if (room) emit(io, eventMap[action], payload);
}

function emitLiveStatus(app, stream) {
  const io = getIo(app);
  if (!io) return;
  emit(io, EVENTS.LIVE_STATUS, stream);
  if (stream.status === "live") {
    emit(io, EVENTS.LIVE_STARTED, stream);
  } else if (stream.status === "ended") {
    emit(io, EVENTS.LIVE_ENDED, stream);
  }
}

function emitNotification(app, notification, userId) {
  const io = getIo(app);
  if (!io) return;
  const room = userId ? `user:${userId}` : null;
  emit(io, EVENTS.NOTIFICATION, notification, room);
  if (!userId) emit(io, EVENTS.NOTIFICATION, notification);
}

function emitComment(app, comment) {
  const io = getIo(app);
  if (!io) return;
  emit(io, EVENTS.COMMENT_ADDED, comment);
  emit(io, EVENTS.NEW_COMMENT, comment);
}

function emitLikeUpdated(app, data) {
  const io = getIo(app);
  if (!io) return;
  emit(io, EVENTS.LIKE_UPDATED, data);
}

function emitViewerCount(app, data) {
  const io = getIo(app);
  if (!io) return;
  emit(io, EVENTS.VIEWER_COUNT, data);
  if (data.streamId) {
    emit(io, EVENTS.VIEWER_COUNT, data, `stream:${data.streamId}`);
  }
}

module.exports = {
  EVENTS,
  emitArticlePublished,
  emitArticleUpdated,
  emitBreakingNews,
  emitLiveStarted,
  emitLiveEnded,
  emitLiveUpdate,
  emitLiveStatus,
  emitNotification,
  emitComment,
  emitLikeUpdated,
  emitViewerCount,
};
