import StreamPlayer from "./StreamPlayer";
import CameraPlayer from "./CameraPlayer";
import {
  resolvePlaybackUrl,
  getPlaybackKind,
} from "../utils/liveStreamPlayback";

export default function LiveStreamView({
  stream,
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
  const kind = getPlaybackKind(stream, mode);
  const playbackUrl = resolvePlaybackUrl(stream, mode);

  if (kind === "webrtc") {
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

  if (kind === "embed" && playbackUrl) {
    return <StreamPlayer url={playbackUrl} title={stream.title} className={className} />;
  }

  let message = "No stream available";
  if (isCamera) {
    if (wantsRecording) {
      message = isLive
        ? "Recording will be available after the broadcast ends"
        : "No recording uploaded yet";
    } else if (!isLive) {
      message = "Camera broadcast not started — admin must click Start Camera & Go Live";
    } else {
      message = "Waiting for camera broadcast…";
    }
  } else if (wantsRecording) {
    message = "No recording available yet";
  } else if (isLive) {
    message = "No stream URL configured — add a YouTube or HLS URL in admin";
  } else {
    message = "Add a stream URL in admin, then click Go Live";
  }

  return (
    <div className={`flex aspect-video items-center justify-center bg-black px-4 text-center text-sm text-slate-400 ${className}`}>
      {message}
    </div>
  );
}
