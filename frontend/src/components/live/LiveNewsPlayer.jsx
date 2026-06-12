import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import LiveStreamView from "../LiveStreamView";
import ViewerCount from "../ViewerCount";
import { getPlaybackKind } from "../../utils/liveStreamPlayback";

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function stopBubble(fn) {
  return (e) => {
    e.stopPropagation();
    e.preventDefault();
    fn(e);
  };
}

export default function LiveNewsPlayer({
  stream,
  event,
  mode = "auto",
  breakingHeadline,
  tickerItems = [],
  reporter,
  timelineUpdates = [],
  className = "",
}) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isBehindLive, setIsBehindLive] = useState(false);
  const [bufferHealth, setBufferHealth] = useState("good");
  const [elapsed, setElapsed] = useState(0);
  const hideControlsTimer = useRef(null);

  const isLive = stream?.status === "live" || event?.status === "live";
  const startedAt = stream?.startedAt || event?.startedAt;
  const peakViewers = stream?.peakViewers || 0;
  const playbackKind = stream ? getPlaybackKind(stream, mode) : "none";
  const isEmbedOnly = playbackKind === "embed" && !hasVideo;
  const canRewind = hasVideo && !(isLive && playbackKind === "webrtc");

  const aiSummary = useMemo(() => {
    if (!timelineUpdates?.length) return null;
    const recent = timelineUpdates.slice(0, 5);
    const points = recent.map((u) => u.title || u.text || u.quote).filter(Boolean);
    return points.length ? points.join(" · ") : null;
  }, [timelineUpdates]);

  const bindVideoRef = useCallback((node) => {
    videoRef.current = node;
    setHasVideo(!!node);
    if (node) {
      node.volume = volume;
      node.muted = muted;
    }
  }, []);

  useEffect(() => {
    setHasVideo(false);
    videoRef.current = null;
    if (!stream) {
      setMuted(true);
      return;
    }
    const kind = getPlaybackKind(stream, mode);
    const live = stream.status === "live";
    setMuted(kind === "webrtc" && live);
  }, [stream?._id, mode, stream?.status]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted, hasVideo]);

  useEffect(() => {
    if (!startedAt || !isLive) return undefined;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, isLive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return undefined;

    const onWaiting = () => setBufferHealth("buffering");
    const onPlaying = () => {
      setBufferHealth("good");
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setMuted(video.muted);
    const onTimeUpdate = () => {
      if (video.duration && video.duration !== Infinity) {
        setIsBehindLive(video.duration - video.currentTime > 15);
      }
    };

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [stream?._id, hasVideo]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(hideControlsTimer.current);
  }, [resetControlsTimer]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      const video = videoRef.current;
      if (video) {
        video.muted = next;
        if (!next) video.play().catch(() => {});
      }
      return next;
    });
  }, []);

  const changeVolume = useCallback((v) => {
    const video = videoRef.current;
    setVolume(v);
    if (video) {
      video.volume = v;
      const isMuted = v === 0;
      video.muted = isMuted;
      setMuted(isMuted);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.requestPictureInPicture) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      /* unsupported */
    }
  }, []);

  const rewind = useCallback(() => {
    const video = videoRef.current;
    if (!video || !canRewind) return;
    if (Number.isFinite(video.duration) && video.duration !== Infinity) {
      video.currentTime = Math.max(0, video.currentTime - 15);
    }
  }, [canRewind]);

  const jumpToLive = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration && video.duration !== Infinity) {
      video.currentTime = video.duration;
      video.play().catch(() => {});
      setIsBehindLive(false);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
      if (e.key === "m") toggleMute();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "p") togglePiP();
      if (e.key === "ArrowLeft") rewind();
      if (e.key === "l") jumpToLive();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleMute, toggleFullscreen, togglePiP, rewind, jumpToLive]);

  const lowerThird = reporter || event?.location ? {
    name: reporter?.name || event?.createdBy?.name,
    location: event?.location,
    headline: breakingHeadline || event?.title,
  } : null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        ref={containerRef}
        className="live-player-shell group relative overflow-hidden rounded-xl bg-black"
        onMouseMove={resetControlsTimer}
        onTouchStart={resetControlsTimer}
      >
        <LiveStreamView stream={stream} mode={mode} videoRef={bindVideoRef} videoMuted={muted} />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3">
          <div className="flex flex-wrap items-center gap-2">
            {isLive && <span className="bbc-live-badge shadow-lg">{t("live")}</span>}
            {stream?._id && isLive && (
              <div className="pointer-events-auto">
                <ViewerCount streamId={stream._id} initial={stream.viewerCount} />
              </div>
            )}
            {hasVideo && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                bufferHealth === "good" ? "bg-emerald-600/80 text-white" : "bg-amber-500/80 text-black"
              }`}>
                {bufferHealth === "good" ? t("streamHealthy") : t("buffering")}
              </span>
            )}
          </div>
          {startedAt && isLive && (
            <div className="rounded-lg bg-black/60 px-2 py-1 text-xs font-mono text-white backdrop-blur">
              {t("onAir")} {formatDuration(elapsed)}
            </div>
          )}
        </div>

        {breakingHeadline && (
          <div className="pointer-events-none absolute left-0 right-0 top-14 z-20 mx-3 animate-pulse rounded-md bg-bbc-red px-4 py-2 text-center text-sm font-bold text-white shadow-lg">
            {t("breaking")}: {breakingHeadline}
          </div>
        )}

        {lowerThird && (
          <div className="pointer-events-none absolute bottom-16 left-0 z-20 max-w-[85%] border-l-4 border-bbc-red bg-gradient-to-r from-black/90 to-transparent px-4 py-2">
            {lowerThird.headline && (
              <p className="text-sm font-bold text-white">{lowerThird.headline}</p>
            )}
            <p className="text-xs text-slate-300">
              {lowerThird.name}
              {lowerThird.location ? ` · ${lowerThird.location}` : ""}
            </p>
          </div>
        )}

        {tickerItems.length > 0 && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 overflow-hidden bg-black/80 py-1.5">
            <div className="animate-marquee whitespace-nowrap text-xs font-semibold text-white">
              {tickerItems.map((item, i) => (
                <span key={`${i}-${item}`} className="mx-8">{item}</span>
              ))}
            </div>
          </div>
        )}

        <div
          className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-10 transition-opacity ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onMouseMove={resetControlsTimer}
          onTouchStart={resetControlsTimer}
        >
          {isBehindLive && hasVideo && (
            <button
              type="button"
              onClick={stopBubble(jumpToLive)}
              className="mb-2 min-h-[44px] rounded-full bg-bbc-red px-4 py-1 text-xs font-bold text-white"
            >
              {t("jumpToLive")} →
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {hasVideo && (
              <>
                <button type="button" onClick={stopBubble(togglePlay)} className="live-ctrl-btn" aria-label={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? "⏸" : "▶"}
                </button>
                {canRewind && (
                  <button type="button" onClick={stopBubble(rewind)} className="live-ctrl-btn" title="-15s">⏪</button>
                )}
                <button type="button" onClick={stopBubble(toggleMute)} className="live-ctrl-btn" aria-label={muted ? "Unmute" : "Mute"}>
                  {muted ? "🔇" : "🔊"}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-20 accent-bbc-red"
                  aria-label="Volume"
                />
                <button type="button" onClick={stopBubble(togglePiP)} className="live-ctrl-btn" title="PiP">⊡</button>
              </>
            )}
            <button type="button" onClick={stopBubble(toggleFullscreen)} className="live-ctrl-btn" title="Fullscreen">⛶</button>
            {isEmbedOnly && (
              <span className="text-[10px] text-white/70 sm:text-xs">{t("useEmbedControls")}</span>
            )}
            {isLive && startedAt && (
              <span className="ml-auto text-xs font-mono text-white/80">{formatDuration(elapsed)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        {peakViewers > 0 && <span>{t("peakViewers")}: {peakViewers.toLocaleString()}</span>}
        {stream?.viewerCount != null && <span>{t("watching")}: {stream.viewerCount.toLocaleString()}</span>}
        {hasVideo && (
          <span className="hidden sm:inline">{t("keyboardShortcuts")}: Space/K play · M mute · F fullscreen · P PiP · ← rewind · L live</span>
        )}
      </div>

      {aiSummary && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-bbc-red">{t("aiSummary")}</h3>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{aiSummary}</p>
        </div>
      )}
    </div>
  );
}
