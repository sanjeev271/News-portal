/** Attach a MediaStream to a video element with mobile-safe autoplay. */
export async function playVideoStream(video, stream, { startMuted = true } = {}) {
  if (!video || !stream) return false;

  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.muted = startMuted;

  try {
    await video.play();
    return true;
  } catch {
    video.muted = true;
    try {
      await video.play();
      return "muted";
    } catch {
      return false;
    }
  }
}
