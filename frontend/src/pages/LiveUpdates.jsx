import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import AdBanner from "../components/AdBanner";
import LiveTimeline from "../components/LiveTimeline";
import LiveEventInfoPanel, { ReporterCard, RelatedArticlesSidebar } from "../components/live/LiveSidebarPanels";
import { PageLoader } from "../components/PageLoader";
import socket from "../socket/socket";
import { applyPageSeo } from "../utils/seo";
import { currentLocale } from "../utils/localize";

export default function LiveUpdates() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freshIds, setFreshIds] = useState(() => new Set());

  useEffect(() => {
    applyPageSeo({ title: t("liveUpdates"), description: t("updatedAutomatically") });
  }, [t]);

  useEffect(() => {
    const locale = currentLocale();
    const loadEvents = () =>
      API.get("/live-events", { params: { live: "true", locale } })
        .then((eventsRes) => {
          const liveEvents = eventsRes.data || [];
          setEvents(liveEvents);
          setActiveEvent((prev) => {
            if (prev && liveEvents.some((e) => e._id === prev._id)) return prev;
            return liveEvents[0] || null;
          });
          return liveEvents;
        });

    Promise.all([
      loadEvents(),
      API.get("/articles", { params: { page: 1, limit: 5, breaking: "true", locale } }),
    ])
      .then(([, articlesRes]) => {
        setRelated(articlesRes.data.articles || articlesRes.data || []);
      })
      .finally(() => setLoading(false));

    const onLiveStarted = (data) => {
      if (!data?.slug) return;
      loadEvents();
    };

    const onUpdateAdded = (data) => {
      if (!data?.eventSlug) return;
      setActiveEvent((prev) => {
        if (prev) return prev;
        return { slug: data.eventSlug, title: data.title || t("liveUpdates"), status: "live" };
      });
      loadEvents();
    };

    socket.on("live_started", onLiveStarted);
    socket.on("live_update_added", onUpdateAdded);
    return () => {
      socket.off("live_started", onLiveStarted);
      socket.off("live_update_added", onUpdateAdded);
    };
  }, [i18n.language, t]);

  useEffect(() => {
    if (!activeEvent?.slug) {
      setUpdates([]);
      return undefined;
    }

    const slug = activeEvent.slug;
    const locale = currentLocale();

    API.get(`/live-events/${slug}/updates`, { params: { locale } })
      .then((res) => setUpdates(res.data.updates || res.data || []))
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

    socket.on("live_update_added", onAdded);
    socket.on("live_update_updated", onUpdated);
    socket.on("live_update_deleted", onDeleted);

    return () => {
      socket.emit("leave_live_event", { slug });
      socket.off("live_update_added", onAdded);
      socket.off("live_update_updated", onUpdated);
      socket.off("live_update_deleted", onDeleted);
    };
  }, [activeEvent?.slug, i18n.language]);

  const selectEvent = (event) => {
    setFreshIds(new Set());
    setActiveEvent(event);
  };

  if (loading) return <PageLoader label={t("loading")} />;

  const isLive = activeEvent?.status === "live";

  return (
    <div className="animate-fade-up">
      <div className="page-hero px-3 py-5 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t("liveUpdates")}
            </h1>
            {isLive && <span className="bbc-live-badge">{t("live")}</span>}
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">{t("updatedAutomatically")}</p>
          <Link
            to="/live-tv"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-bbc-red hover:underline"
          >
            📺 {t("watchFullBroadcast")} →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        {!activeEvent ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-600 dark:bg-slate-900/50">
            <p className="text-slate-500">{t("noLiveUpdatesYet")}</p>
            <Link to="/live-tv" className="mt-4 inline-block text-sm font-bold text-bbc-red hover:underline">
              📺 {t("liveTV")} →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="space-y-6 lg:col-span-2 lg:space-y-8">
              {events.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {events.map((ev) => (
                    <button
                      key={ev._id}
                      type="button"
                      onClick={() => selectEvent(ev)}
                      className={`tab-chip min-h-[40px] ${activeEvent._id === ev._id ? "tab-chip-active" : "tab-chip-inactive"}`}
                    >
                      {ev.title}
                      {ev.status === "live" && (
                        <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-bbc-red" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <Link
                  to={`/live-event/${activeEvent.slug}`}
                  className="text-xl font-extrabold text-slate-900 hover:text-bbc-red dark:text-white sm:text-2xl"
                >
                  {activeEvent.title} →
                </Link>
                {activeEvent.description && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
                    {activeEvent.description}
                  </p>
                )}
              </div>

              <LiveTimeline updates={updates} freshIds={freshIds} isLive={isLive} />

              <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                {t("engageOnLiveTV")}{" "}
                <Link to="/live-tv" className="font-bold text-bbc-red hover:underline">{t("liveTV")}</Link>
              </p>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start lg:space-y-5">
              <LiveEventInfoPanel event={activeEvent} />
              <ReporterCard event={activeEvent} />
              <RelatedArticlesSidebar articles={related} />
              <AdBanner placement="sidebar" />
              <Link to="/live-tv" className="block text-sm font-bold text-bbc-red hover:underline">
                📺 {t("liveTV")}
              </Link>
              <Link to="/" className="block text-sm font-bold text-bbc-red hover:underline">
                ← {t("backToHome")}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
