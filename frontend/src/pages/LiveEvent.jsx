import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import AdBanner from "../components/AdBanner";
import LiveNewsPlayer from "../components/live/LiveNewsPlayer";
import LiveTimeline from "../components/LiveTimeline";
import SocialShare from "../components/SocialShare";
import LiveEventInfoPanel, { ReporterCard, RelatedArticlesSidebar } from "../components/live/LiveSidebarPanels";
import { PageLoader } from "../components/PageLoader";
import socket from "../socket/socket";
import { applyPageSeo } from "../utils/seo";
import { formatTime, getImageUrl } from "../utils/formatTime";
import { currentLocale } from "../utils/localize";

export default function LiveEvent() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [event, setEvent] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freshIds, setFreshIds] = useState(() => new Set());

  useEffect(() => {
    const locale = currentLocale();
    const load = () =>
      Promise.all([
        API.get(`/live-events/${slug}`),
        API.get(`/live-events/${slug}/updates`, { params: { locale } }),
        API.get("/articles", { params: { page: 1, limit: 5, locale } }),
      ])
        .then(([ev, up, rel]) => {
          setEvent(ev.data);
          setUpdates(up.data.updates || up.data);
          setRelated(rel.data.articles || rel.data || []);
          applyPageSeo({
            title: ev.data.title,
            description: ev.data.description,
            image: ev.data.coverImage ? getImageUrl(ev.data.coverImage) : undefined,
            url: window.location.href,
            type: "website",
          });
        })
        .finally(() => setLoading(false));

    load();

    socket.emit("join_live_event", { slug });

    const highlight = (id) => {
      setFreshIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setFreshIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 120000);
    };

    const onAdded = (data) => {
      if (data.eventSlug !== slug) return;
      setUpdates((prev) => [data, ...prev.filter((u) => u._id !== data._id)]);
      highlight(data._id);
    };
    const onUpdated = (data) => {
      if (data.eventSlug !== slug) return;
      setUpdates((prev) => prev.map((u) => (u._id === data._id ? data : u)));
    };
    const onDeleted = (data) => {
      if (data.eventSlug !== slug) return;
      setUpdates((prev) => prev.filter((u) => u._id !== data._id));
    };
    const onLiveStarted = (data) => {
      if (data.slug === slug) setEvent((e) => (e ? { ...e, status: "live" } : e));
    };
    const onLiveEnded = (data) => {
      if (data.slug === slug) setEvent((e) => (e ? { ...e, status: "ended" } : e));
    };

    socket.on("live_update_added", onAdded);
    socket.on("live_update_updated", onUpdated);
    socket.on("live_update_deleted", onDeleted);
    socket.on("live_started", onLiveStarted);
    socket.on("live_ended", onLiveEnded);

    return () => {
      socket.emit("leave_live_event", { slug });
      socket.off("live_update_added", onAdded);
      socket.off("live_update_updated", onUpdated);
      socket.off("live_update_deleted", onDeleted);
      socket.off("live_started", onLiveStarted);
      socket.off("live_ended", onLiveEnded);
    };
  }, [slug, i18n.language]);

  if (loading) return <PageLoader label={t("loadingBroadcast")} />;
  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-slate-500">{t("eventNotFound")}</p>
        <Link to="/" className="mt-4 inline-block text-bbc-red hover:underline">← {t("backToHome")}</Link>
      </div>
    );
  }

  const stream = event.liveStream;
  const isLive = event.status === "live";
  const tickerItems = updates.filter((u) => u.isBreaking).map((u) => u.title || u.text).slice(0, 5);
  const breakingHeadline = updates.find((u) => u.isBreaking)?.title || updates.find((u) => u.isBreaking)?.text;

  return (
    <div className="animate-fade-up">
      <div className="page-hero px-3 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {isLive && <span className="bbc-live-badge">{t("live")}</span>}
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {event.title}
            </h1>
          </div>
          {event.description && (
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            {event.location && <span>📍 {event.location}</span>}
            {event.startedAt && <span>{t("started")} {formatTime(event.startedAt)}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2 lg:space-y-8">
            {stream && (
              <LiveNewsPlayer
                stream={stream}
                event={event}
                breakingHeadline={breakingHeadline}
                tickerItems={tickerItems}
                reporter={event.createdBy}
                timelineUpdates={updates}
              />
            )}

            <LiveTimeline updates={updates} freshIds={freshIds} isLive={isLive} />

            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
              {t("engageOnLiveTV")}{" "}
              <Link to="/live-tv" className="font-bold text-bbc-red hover:underline">{t("liveTV")}</Link>
            </p>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start lg:space-y-5">
            <LiveEventInfoPanel event={event} stream={stream} />
            <ReporterCard event={event} />
            <RelatedArticlesSidebar articles={related} />
            <SocialShare title={event.title} />
            <AdBanner placement="sidebar" />
            <Link to="/live-tv" className="block text-sm font-bold text-bbc-red hover:underline">📺 {t("liveTV")}</Link>
            <Link to="/" className="block text-sm font-bold text-bbc-red hover:underline">← {t("backToHome")}</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
