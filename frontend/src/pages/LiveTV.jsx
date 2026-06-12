import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import AdBanner from "../components/AdBanner";
import LiveNewsPlayer from "../components/live/LiveNewsPlayer";
import LiveEngagementPanel from "../components/live/LiveEngagementPanel";
import SocialShare from "../components/SocialShare";
import { ReporterCard, RelatedArticlesSidebar } from "../components/live/LiveSidebarPanels";
import { PageLoader } from "../components/PageLoader";
import socket from "../socket/socket";
import { applyPageSeo } from "../utils/seo";
import { formatTime } from "../utils/formatTime";
import { currentLocale } from "../utils/localize";

export default function LiveTV() {
  const { t, i18n } = useTranslation();
  const [stream, setStream] = useState(null);
  const [related, setRelated] = useState([]);
  const [viewMode, setViewMode] = useState("auto");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyPageSeo({ title: t("liveTV"), description: t("liveTVHero") });
  }, [t]);

  useEffect(() => {
    const load = async () => {
      try {
        const locale = currentLocale();
        const [streamRes, articlesRes] = await Promise.all([
          API.get("/live/active"),
          API.get("/articles", { params: { page: 1, limit: 5, breaking: "true", locale } }),
        ]);
        setStream(streamRes.data);
        setRelated(articlesRes.data.articles || articlesRes.data || []);
      } finally {
        setLoading(false);
      }
    };

    load();

    const onLiveStatus = (data) => {
      setStream(data);
      load();
    };

    socket.on("live_status", onLiveStatus);
    window.addEventListener("focus", load);
    return () => {
      socket.off("live_status", onLiveStatus);
      window.removeEventListener("focus", load);
    };
  }, [i18n.language]);

  const isLive = stream?.status === "live";
  const engageRoom = stream?._id;

  if (loading) return <PageLoader label={t("loadingBroadcast")} />;

  return (
    <div className="animate-fade-up">
      <div className="page-hero px-3 py-5 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t("liveTV")}
            </h1>
            {isLive && <span className="bbc-live-badge">{t("live")}</span>}
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">{t("liveTVHero")}</p>
          <Link
            to="/live"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-bbc-red hover:underline"
          >
            {t("liveUpdates")} →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2 lg:space-y-8">
            {stream ? (
              <>
                <LiveNewsPlayer stream={stream} mode={viewMode} />

                <div className="flex flex-wrap gap-2">
                  {(stream.streamType === "camera" || stream.streamUrl || stream.youtubeUrl || stream.hlsUrl) && (
                    <button
                      type="button"
                      onClick={() => setViewMode("live")}
                      className={`tab-chip min-h-[44px] ${(viewMode === "live" || (viewMode === "auto" && isLive)) ? "tab-chip-active" : "tab-chip-inactive"}`}
                    >
                      {stream.streamType === "camera" ? t("liveCamera") : t("liveStream")}
                    </button>
                  )}
                  {(stream.recordingUrl || (stream.streamType === "camera" && !isLive)) && (
                    <button
                      type="button"
                      onClick={() => setViewMode("recording")}
                      className={`tab-chip min-h-[44px] ${(viewMode === "recording" || (viewMode === "auto" && !isLive)) ? "tab-chip-active" : "tab-chip-inactive"}`}
                    >
                      {t("recordingReplay")}
                    </button>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">{stream.title}</h2>
                  {stream.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">{stream.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400 sm:text-sm">
                    {stream.startedAt && <span>{t("started")} {formatTime(stream.startedAt)}</span>}
                    {stream.endedAt && !isLive && <span>{t("ended")} {formatTime(stream.endedAt)}</span>}
                  </div>
                  <SocialShare title={stream.title} />
                </div>
              </>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 dark:border-slate-600 dark:bg-slate-900/50">
                <span className="text-4xl opacity-40">📡</span>
                <p className="text-center text-slate-500">{t("noBroadcastScheduled")}</p>
                <Link to="/" className="text-sm font-bold text-bbc-red hover:underline">← {t("backToHome")}</Link>
              </div>
            )}

            {engageRoom && <LiveEngagementPanel roomId={engageRoom} />}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start lg:space-y-5">
            {stream?.createdBy && <ReporterCard event={{ createdBy: stream.createdBy }} />}
            <RelatedArticlesSidebar articles={related} />
            <AdBanner placement="sidebar" />
            <Link to="/live" className="block text-sm font-bold text-bbc-red hover:underline">
              {t("liveUpdates")} →
            </Link>
            <Link to="/" className="block text-sm font-bold text-bbc-red hover:underline">← {t("backToHome")}</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
