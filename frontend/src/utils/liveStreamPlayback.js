import { isYoutubeUrl } from "./youtubeUrl";

/** http(s) link — YouTube, HLS page, etc. */
export function isExternalStreamUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//");
}

function hasExternalStreamUrl(url) {
  return isExternalStreamUrl(url) || isYoutubeUrl(url);
}

/**
 * Resolve what to play.
 * - Camera + live  → WebRTC (no URL), unless streamUrl is an external link
 * - Camera + replay → recordingUrl only (uploaded .webm or optional link)
 * - URL type       → streamUrl when live, recordingUrl when replay (with fallbacks)
 */
export function resolvePlaybackUrl(stream, mode = "auto") {
  if (!stream) return null;

  const isLive = stream.status === "live";
  const wantsRecording = mode === "recording" || (mode === "auto" && !isLive);

  if (stream.streamType === "camera") {
    if (wantsRecording) {
      return stream.recordingUrl || null;
    }
    if (hasExternalStreamUrl(stream.streamUrl)) {
      return stream.streamUrl.trim();
    }
    return null;
  }

  if (wantsRecording) {
    return stream.recordingUrl || stream.streamUrl || null;
  }
  return stream.streamUrl || stream.recordingUrl || null;
}

/** WebRTC only for live camera broadcasts without an external streamUrl. */
export function shouldUseWebRtcCamera(stream, mode = "auto") {
  if (!stream || stream.streamType !== "camera") return false;

  const isLive = stream.status === "live";
  const wantsRecording = mode === "recording" || (mode === "auto" && !isLive);

  if (!isLive || wantsRecording) return false;
  if (hasExternalStreamUrl(stream.streamUrl)) return false;

  return true;
}

export function getPlaybackKind(stream, mode = "auto") {
  if (shouldUseWebRtcCamera(stream, mode)) return "webrtc";
  if (resolvePlaybackUrl(stream, mode)) return "embed";
  return "none";
}
