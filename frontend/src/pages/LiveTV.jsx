import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import AdBanner from "../components/AdBanner";
import LiveStreamView from "../components/LiveStreamView";
import { PageLoader } from "../components/PageLoader";
import socket from "../socket/socket";
import { formatTime } from "../utils/formatTime";

export default function LiveTV() {
  const { t } = useTranslation();
  const [stream, setStream] = useState(null);
  const [viewMode, setViewMode] = useState("auto");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      API.get("/live/active")
        .then((r) => setStream(r.data))
        .finally(() => setLoading(false));
    load();
    const onLiveStatus = (data) => setStream(data);
    socket.on("live_status", onLiveStatus);
    window.addEventListener("focus", load);
    return () => {
      socket.off("live_status", onLiveStatus);
      window.removeEventListener("focus", load);
    };
  }, []);

  const isLive = stream?.status === "live";

  if (loading) return <PageLoader label="Loading broadcast…" />;

  return (
    <div className="animate-fade-up">
      <div className="page-hero px-3 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t("liveTV")}
            </h1>
            {isLive && <span className="bbc-live-badge">Live</span>}
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
            Breaking news coverage as it happens — switch to replay when the broadcast ends.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {stream ? (
              <>
                <div className="media-frame mb-5">
                  <LiveStreamView stream={stream} mode={viewMode} />
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {(stream.streamType === "camera" || stream.streamUrl) && (
                    <button
                      type="button"
                      onClick={() => setViewMode("live")}
                      className={`tab-chip ${(viewMode === "live" || (viewMode === "auto" && isLive)) ? "tab-chip-active" : "tab-chip-inactive"}`}
                    >
                      {stream.streamType === "camera" ? "📷 Live Camera" : "▶ Live Stream"}
                    </button>
                  )}
                  {(stream.recordingUrl || (stream.streamType === "camera" && !isLive)) && (
                    <button
                      type="button"
                      onClick={() => setViewMode("recording")}
                      className={`tab-chip ${(viewMode === "recording" || (viewMode === "auto" && !isLive)) ? "tab-chip-active" : "tab-chip-inactive"}`}
                    >
                      Recording / Replay
                    </button>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stream.title}</h2>
                {stream.description && (
                  <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">{stream.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                  {stream.startedAt && <span>Started {formatTime(stream.startedAt)}</span>}
                  {stream.endedAt && !isLive && <span>Ended {formatTime(stream.endedAt)}</span>}
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase dark:bg-slate-800">
                    {stream.streamType === "camera" ? "WebRTC" : "External"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50">
                <span className="text-4xl opacity-40">📡</span>
                <p className="text-slate-500">No live broadcast scheduled</p>
                <Link to="/" className="text-sm font-bold text-bbc-red hover:underline">← Back to homepage</Link>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <AdBanner placement="sidebar" />
            <section className="sidebar-card">
              <h3 className="bbc-section-title mb-3 text-base dark:text-white">About Live TV</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Watch breaking news coverage as it happens. When the broadcast ends, switch to the recording for the full replay.
              </p>
              <Link to="/" className="mt-4 inline-block text-sm font-bold text-bbc-red hover:underline">
                ← Back to homepage
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
