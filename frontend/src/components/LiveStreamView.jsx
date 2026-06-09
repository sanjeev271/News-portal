import StreamPlayer from "./StreamPlayer";
import CameraPlayer from "./CameraPlayer";

export default function LiveStreamView({
  stream,
  url,
  mode = "auto",
  className = "",
}) {
  if (!stream) {
    return (
      <div className={`flex aspect-video items-center justify-center bg-black text-slate-400 ${className}`}>
        No broadcast scheduled
      </div>
    );
  }

  const isLive = stream.status === "live";
  const isCamera = stream.streamType === "camera";
  const wantsRecording = mode === "recording" || (mode === "auto" && !isLive);

  if (isCamera) {
    if (wantsRecording && stream.recordingUrl) {
      return <StreamPlayer url={stream.recordingUrl} title={stream.title} className={className} />;
    }

    if (wantsRecording && !stream.recordingUrl) {
      return (
        <div className={`flex aspect-video items-center justify-center bg-black text-slate-400 ${className}`}>
          {isLive
            ? "Recording will be available after the broadcast ends"
            : "Camera broadcast — start from admin panel to go live"}
        </div>
      );
    }

    return (
      <CameraPlayer
        streamId={stream._id}
        active={isLive}
        className={className}
        label={
          isLive
            ? "Waiting for live camera feed…"
            : "Camera broadcast not started yet"
        }
      />
    );
  }

  const streamUrl = url || stream.streamUrl;
  if (!streamUrl) {
    return (
      <div className={`flex aspect-video items-center justify-center bg-black text-slate-400 ${className}`}>
        {isLive
          ? "No stream URL configured — add a YouTube or HLS URL in admin"
          : "Add a stream URL in admin, then click Go Live"}
      </div>
    );
  }

  return <StreamPlayer url={streamUrl} title={stream.title} className={className} />;
}
