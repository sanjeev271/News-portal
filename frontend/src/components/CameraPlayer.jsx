import useWebRTCViewer from "../hooks/useWebRTCViewer";
import { playVideoStream } from "../utils/playVideoStream";

function assignRef(ref, node) {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else if ("current" in ref) ref.current = node;
}

export function LocalCameraPreview({ videoRef, className = "", onVideoMount }) {
  const setRef = (node) => {
    assignRef(videoRef, node);
    if (node) onVideoMount?.();
  };

  return (
    <div className={`aspect-video overflow-hidden bg-black ${className}`}>
      <video
        ref={setRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{ WebkitPlaysinline: "true" }}
      />
    </div>
  );
}

export default function CameraPlayer({
  streamId,
  active,
  className = "",
  label = "Connecting to live camera…",
  videoRef: externalVideoRef,
  muted = true,
}) {
  const { remoteVideoRef, connected, needsTap, error, tapToPlay } = useWebRTCViewer(
    streamId ? String(streamId) : null,
    active
  );

  const setVideoRef = (node) => {
    assignRef(remoteVideoRef, node);
    assignRef(externalVideoRef, node);
  };

  const handleTap = async () => {
    if (needsTap) {
      await tapToPlay();
      return;
    }
    const video = remoteVideoRef.current;
    if (video?.srcObject) {
      await playVideoStream(video, video.srcObject, { startMuted: false });
    }
  };

  return (
    <div className={`relative aspect-video min-h-[200px] overflow-hidden bg-black ${className}`}>
      <video
        ref={setVideoRef}
        autoPlay
        playsInline
        muted={muted}
        className="h-full w-full bg-black object-contain"
        style={{ WebkitPlaysinline: "true" }}
      />
      {active && connected && !needsTap && (
        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <span className="bbc-live-badge">Live</span>
        </div>
      )}
      {active && needsTap && connected && (
        <button
          type="button"
          onClick={handleTap}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-sm font-bold text-white"
        >
          Tap to play live stream
        </button>
      )}
      {active && !connected && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/80 px-4 text-center text-sm text-white">
          <p>{error || label}</p>
          {error && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-1 rounded bg-bbc-red px-3 py-1.5 text-xs font-bold"
            >
              Retry
            </button>
          )}
        </div>
      )}
      {!streamId && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
          {label}
        </div>
      )}
    </div>
  );
}
