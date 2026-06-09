import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

export default function SocketStreamPlayer({ streamId, active, className = "", label = "Connecting to live stream…" }) {
  const videoRef = useRef(null);
  const queueRef = useRef([]);
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    if (!active || !streamId) return undefined;

    const sid = String(streamId);
    const video = videoRef.current;
    if (!video) return undefined;

    let sourceBuffer = null;
    let mediaSource = null;
    let closed = false;

    const appendNext = () => {
      if (!sourceBuffer || sourceBuffer.updating || !queueRef.current.length) return;
      const chunk = queueRef.current.shift();
      try {
        sourceBuffer.appendBuffer(chunk);
        setStatus("playing");
      } catch {
        queueRef.current.unshift(chunk);
      }
    };

    const onChunk = ({ streamId: id, chunk }) => {
      if (String(id) !== sid || closed) return;
      const bytes = chunk?.data ? new Uint8Array(chunk.data) : new Uint8Array(chunk);
      queueRef.current.push(bytes);
      appendNext();
    };

    const onBroadcasterReady = ({ streamId: id }) => {
      if (String(id) === sid) socket.emit("viewer_ping", { streamId: sid });
    };

    const setup = () => {
      mediaSource = new MediaSource();
      video.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener("sourceopen", () => {
        const mime = MediaSource.isTypeSupported('video/webm; codecs="vp9,opus"')
          ? 'video/webm; codecs="vp9,opus"'
          : 'video/webm; codecs="vp8,opus"';
        try {
          sourceBuffer = mediaSource.addSourceBuffer(mime);
        } catch {
          sourceBuffer = mediaSource.addSourceBuffer("video/webm");
        }
        sourceBuffer.mode = "sequence";
        sourceBuffer.addEventListener("updateend", appendNext);
      });
    };

    setup();
    socket.on("live_chunk", onChunk);
    socket.on("broadcaster_ready", onBroadcasterReady);
    socket.emit("join_live_room", { streamId: sid, role: "viewer" });
    socket.emit("viewer_ping", { streamId: sid });

    const ping = setInterval(() => socket.emit("viewer_ping", { streamId: sid }), 2500);

    return () => {
      closed = true;
      clearInterval(ping);
      socket.off("live_chunk", onChunk);
      socket.off("broadcaster_ready", onBroadcasterReady);
      socket.emit("leave_live_room");
      queueRef.current = [];
      if (mediaSource?.readyState === "open") {
        try { mediaSource.endOfStream(); } catch { /* noop */ }
      }
      if (video) video.removeAttribute("src");
    };
  }, [streamId, active]);

  return (
    <div className={`relative aspect-video overflow-hidden bg-black ${className}`}>
      <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
      {active && status === "playing" && (
        <div className="pointer-events-none absolute left-3 top-3">
          <span className="bbc-live-badge">Live</span>
        </div>
      )}
      {active && status !== "playing" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white">
          {label}
        </div>
      )}
    </div>
  );
}
