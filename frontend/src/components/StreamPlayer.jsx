import { useMemo } from "react";
import { getImageUrl } from "../utils/formatTime";
import {
  isYoutubeUrl,
  toYoutubeEmbedUrl,
  toYoutubeWatchUrl,
} from "../utils/youtubeUrl";

export default function StreamPlayer({
  url,
  title = "Stream",
  className = "",
  videoRef,
  hideNativeControls = false,
  muted = false,
}) {
  const youtubeEmbed = useMemo(
    () => (url && isYoutubeUrl(url) ? toYoutubeEmbedUrl(url) : null),
    [url]
  );
  const youtubeWatch = useMemo(
    () => (url && isYoutubeUrl(url) ? toYoutubeWatchUrl(url) : null),
    [url]
  );

  if (!url) {
    return (
      <div className={`flex aspect-video items-center justify-center bg-black text-slate-400 ${className}`}>
        No stream URL configured
      </div>
    );
  }

  const isVideoFile = /\.(mp4|webm|ogg|m3u8)$/i.test(url) || url.includes("/uploads/");

  return (
    <div className={className}>
      {youtubeEmbed ? (
        <>
          <div className="aspect-video overflow-hidden bg-black">
            <iframe
              key={youtubeEmbed}
              src={youtubeEmbed}
              className="h-full w-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title={title}
            />
          </div>
          {youtubeWatch && (
            <div className="border border-t-0 border-slate-800 bg-slate-950 px-3 py-2 text-center">
              <a
                href={youtubeWatch}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-bbc-red hover:underline"
              >
                YouTube not playing? Open on YouTube →
              </a>
            </div>
          )}
        </>
      ) : isYoutubeUrl(url) ? (
        <div className="flex aspect-video min-h-[200px] flex-col items-center justify-center gap-2 bg-black px-4 text-center text-sm text-slate-400">
          <p>Could not embed this YouTube link.</p>
          <p className="text-xs">Use a watch link (youtube.com/watch?v=…), youtu.be/…, or youtube.com/live/…</p>
          {youtubeWatch && (
            <a href={youtubeWatch} target="_blank" rel="noopener noreferrer" className="text-bbc-red hover:underline">
              Open on YouTube →
            </a>
          )}
        </div>
      ) : isVideoFile ? (
        <div className="aspect-video overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={getImageUrl(url)}
            controls={!hideNativeControls}
            muted={muted}
            className="h-full w-full"
            playsInline
          />
        </div>
      ) : (
        <div className="aspect-video overflow-hidden bg-black">
          <iframe
            src={url}
            className="h-full w-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            title={title}
          />
        </div>
      )}
    </div>
  );
}
