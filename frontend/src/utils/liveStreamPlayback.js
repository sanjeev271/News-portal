import { isYoutubeUrl } from "./youtubeUrl";

export function isExternalStreamUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//");
}

function hasExternalStreamUrl(url) {
  return isExternalStreamUrl(url) || isYoutubeUrl(url);
}

function pickStreamUrl(stream, wantsRecording) {
  if (!stream) return null;

  if (wantsRecording) {
    return stream.recordingUrl || stream.streamUrl || stream.hlsUrl || stream.youtubeUrl || stream.iframeUrl || null;
  }

  if (stream.streamType === "youtube" && stream.youtubeUrl) return stream.youtubeUrl;
  if (stream.streamType === "hls" && stream.hlsUrl) return stream.hlsUrl;
  if (stream.streamType === "iframe" && stream.iframeUrl) return stream.iframeUrl;

  return stream.streamUrl || stream.youtubeUrl || stream.hlsUrl || stream.iframeUrl || stream.recordingUrl || null;
}

export function resolvePlaybackUrl(stream, mode = "auto") {
  if (!stream) return null;

  const isLive = stream.status === "live";
  const wantsRecording = mode === "recording" || (mode === "auto" && !isLive);

  if (stream.streamType === "camera") {
    if (wantsRecording) return stream.recordingUrl || null;
    if (hasExternalStreamUrl(stream.streamUrl)) return stream.streamUrl.trim();
    return null;
  }

  return pickStreamUrl(stream, wantsRecording);
}

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
