import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import AdBanner from "../components/AdBanner";
import LiveStreamView from "../components/LiveStreamView";
import socket from "../socket/socket";
import { formatTime } from "../utils/formatTime";

export default function LiveTV() {
  const { t } = useTranslation();
  const [stream, setStream] = useState(null);
  const [viewMode, setViewMode] = useState("auto");

  useEffect(() => {
    const load = () => API.get("/live/active").then((r) => setStream(r.data));
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
  const autoUrl = isLive ? stream?.streamUrl : stream?.recordingUrl;
  const previewUrl =
    viewMode === "live" ? stream?.streamUrl :
    viewMode === "recording" ? stream?.recordingUrl :
    autoUrl;

  return (
    <div className="bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-bbc-grey px-4 py-6 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <h1 className="text-2xl font-extrabold dark:text-white sm:text-3xl">{t("liveTV")}</h1>
          {isLive && <span className="bbc-live-badge">Live</span>}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {stream ? (
              <>
                <LiveStreamView stream={stream} url={previewUrl} mode={viewMode} className="mb-4" />
                <div className="mb-4 flex flex-wrap gap-2">
                  {(stream.streamUrl || stream.streamType === "camera") && (
                    <button
                      onClick={() => setViewMode("live")}
                      className={`px-4 py-1.5 text-sm font-bold ${
                        (viewMode === "live" || (viewMode === "auto" && isLive))
                          ? "bg-bbc-red text-white"
                          : "border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Live Stream
                    </button>
                  )}
                  {stream.recordingUrl && (
                    <button
                      onClick={() => setViewMode("recording")}
                      className={`px-4 py-1.5 text-sm font-bold ${
                        (viewMode === "recording" || (viewMode === "auto" && !isLive))
                          ? "bg-bbc-black text-white dark:bg-white dark:text-bbc-black"
                          : "border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Recording / Replay
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">{stream.title}</h2>
                {stream.description && (
                  <p className="mt-3 text-slate-600 dark:text-slate-400">{stream.description}</p>
                )}
                <div className="mt-4 flex gap-4 text-sm text-slate-400">
                  {stream.startedAt && <span>Started {formatTime(stream.startedAt)}</span>}
                  {stream.endedAt && !isLive && <span>Ended {formatTime(stream.endedAt)}</span>}
                </div>
              </>
            ) : (
              <div className="flex aspect-video items-center justify-center border border-slate-200 bg-bbc-grey text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                No live broadcast scheduled
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <AdBanner placement="sidebar" />
            <section className="border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="bbc-section-title mb-3 text-base dark:text-white">About Live TV</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
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
