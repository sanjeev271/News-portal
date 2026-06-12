import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import socket from "../socket/socket";
import LiveUpdateEntry from "./LiveUpdateEntry";
import PageContainer from "./ui/PageContainer";
import { currentLocale, dedupeById } from "../utils/localize";

export default function LiveUpdatesSection({ liveEvents = [], limit = 8 }) {
  const { t, i18n } = useTranslation();
  const [updates, setUpdates] = useState([]);
  const [freshIds, setFreshIds] = useState(() => new Set());
  const primaryEvent = liveEvents[0];

  useEffect(() => {
    if (!primaryEvent?.slug) {
      setUpdates([]);
      return undefined;
    }

    const slug = primaryEvent.slug;
    const locale = currentLocale();

    API.get(`/live-events/${slug}/updates`, { params: { limit: limit + 5, locale } })
      .then((res) => setUpdates(dedupeById(res.data.updates || res.data || []).slice(0, limit)))
      .catch(() => setUpdates([]));

    socket.emit("join_live_event", { slug });

    const highlight = (id) => {
      setFreshIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setFreshIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 90000);
    };

    const onAdded = (data) => {
      if (data.eventSlug !== slug) return;
      setUpdates((prev) => [data, ...prev.filter((u) => u._id !== data._id)].slice(0, limit));
      highlight(data._id);
    };
    const onUpdated = (data) => {
      if (data.eventSlug !== slug) return;
      setUpdates((prev) => prev.map((u) => (u._id === data._id ? data : u)).slice(0, limit));
    };
    const onDeleted = (data) => {
      if (data.eventSlug !== slug) return;
      setUpdates((prev) => prev.filter((u) => u._id !== data._id));
    };

    socket.on("live_update_added", onAdded);
    socket.on("live_update_updated", onUpdated);
    socket.on("live_update_deleted", onDeleted);

    return () => {
      socket.emit("leave_live_event", { slug });
      socket.off("live_update_added", onAdded);
      socket.off("live_update_updated", onUpdated);
      socket.off("live_update_deleted", onDeleted);
    };
  }, [primaryEvent?.slug, limit, i18n.language]);

  if (!primaryEvent && !updates.length) return null;

  const sorted = dedupeById(updates).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <section className="bbc-live-section" aria-label={t("liveUpdates")}>
      <div className="bbc-live-header">
        <PageContainer className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex items-center gap-3">
            <span className="bbc-live-header-badge">{t("live")}</span>
            <div>
              <h2 className="bbc-live-header-title">{t("liveUpdates")}</h2>
              {primaryEvent && (
                <p className="bbc-live-header-sub">{primaryEvent.title}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/live" className="bbc-live-header-link">
              {t("followLive")} →
            </Link>
            <Link to="/live-tv" className="bbc-live-header-cta">
              📺 {t("watchNow")}
            </Link>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-5 sm:py-8">
        {primaryEvent && (
          <Link to={`/live-event/${primaryEvent.slug}`} className="bbc-live-event-banner">
            <span className="bbc-live-event-label">{t("liveCoverage")}</span>
            <span className="bbc-live-event-title">{primaryEvent.title}</span>
            {primaryEvent.location && <span className="bbc-live-event-meta">📍 {primaryEvent.location}</span>}
          </Link>
        )}

        {!sorted.length ? (
          <p className="bbc-live-empty">{t("noLiveUpdatesYet")}</p>
        ) : (
          <div className="bbc-live-feed">
            <p className="bbc-live-feed-label">{t("keyUpdates")}</p>
            <div className="bbc-live-feed-list">
              {sorted.map((update) => (
                <LiveUpdateEntry
                  key={update._id}
                  update={update}
                  isFresh={freshIds.has(update._id)}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
