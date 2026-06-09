const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const CHANNEL_ID_RE = /^UC[\w-]{22}$/;
const EMBED_HOST = "https://www.youtube-nocookie.com";

function isYoutubeHost(hostname) {
  const host = hostname.replace(/^www\./, "").replace(/^m\./, "");
  return (
    host === "youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com"
  );
}

function isValidVideoId(id) {
  return typeof id === "string" && VIDEO_ID_RE.test(id);
}

function buildEmbedParams({ autoplay = true } = {}) {
  const params = new URLSearchParams();
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  params.set("rel", "0");
  params.set("modestbranding", "1");
  params.set("playsinline", "1");
  params.set("enablejsapi", "1");

  if (typeof window !== "undefined") {
    if (window.location?.origin) {
      params.set("origin", window.location.origin);
    }
    if (window.location?.href) {
      params.set("widget_referrer", window.location.href);
    }
  }

  return params;
}

/** Extract 11-char video ID from any common YouTube link (including malformed embed?v= links). */
export function extractYoutubeVideoId(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (isValidVideoId(raw)) return raw;

  const fromQuery = raw.match(/(?:[?&]v=)([a-zA-Z0-9_-]{11})/);
  if (fromQuery && isValidVideoId(fromQuery[1])) return fromQuery[1];

  const fromPath = raw.match(
    /(?:youtu\.be\/|\/embed\/|\/live\/|\/shorts\/|\/v\/)([a-zA-Z0-9_-]{11})/
  );
  if (fromPath && isValidVideoId(fromPath[1])) return fromPath[1];

  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (!isYoutubeHost(parsed.hostname)) return null;

    const v = parsed.searchParams.get("v");
    if (isValidVideoId(v)) return v;

    const path = parsed.pathname;
    const pathMatch = path.match(/^\/(live|shorts|v|embed)\/([a-zA-Z0-9_-]{11})/);
    if (pathMatch && isValidVideoId(pathMatch[2])) return pathMatch[2];

    if (path === "/embed" || path.startsWith("/embed/")) {
      const embedTail = path.slice("/embed".length).replace(/^\//, "");
      const idFromSlash = embedTail.split(/[/?#]/)[0];
      if (isValidVideoId(idFromSlash)) return idFromSlash;
    }

    if (parsed.hostname.replace(/^www\./, "") === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      if (isValidVideoId(id)) return id;
    }
  } catch {
    // fall through
  }

  return null;
}

export function extractYoutubeChannelId(input) {
  const raw = String(input || "").trim();
  const fromPath = raw.match(/\/channel\/(UC[\w-]{22})/);
  if (fromPath && CHANNEL_ID_RE.test(fromPath[1])) return fromPath[1];

  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const channelLive = parsed.pathname.match(/^\/channel\/(UC[\w-]{22})\/live/);
    if (channelLive && CHANNEL_ID_RE.test(channelLive[1])) return channelLive[1];

    const fromQuery = parsed.searchParams.get("channel");
    if (fromQuery && CHANNEL_ID_RE.test(fromQuery)) return fromQuery;
  } catch {
    // fall through
  }

  return null;
}

/**
 * Build a privacy-enhanced YouTube embed URL (fixes many Playback ID / Error 153 issues).
 */
export function toYoutubeEmbedUrl(input, options = {}) {
  const raw = String(input || "").trim();
  if (!raw) return null;

  const params = buildEmbedParams(options);

  const channelId = extractYoutubeChannelId(raw);
  if (channelId) {
    params.set("channel", channelId);
    return `${EMBED_HOST}/embed/live_stream?${params}`;
  }

  const videoId = extractYoutubeVideoId(raw);
  if (videoId) {
    return `${EMBED_HOST}/embed/${videoId}?${params}`;
  }

  return null;
}

export function isYoutubeUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return false;
  if (raw.includes("youtu.be")) return true;
  if (extractYoutubeVideoId(raw) || extractYoutubeChannelId(raw)) return true;
  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return isYoutubeHost(parsed.hostname);
  } catch {
    return /youtube\.com|youtu\.be/i.test(raw);
  }
}

/** Open the original link on YouTube (fallback when embed is blocked). */
export function toYoutubeWatchUrl(input) {
  const id = extractYoutubeVideoId(input);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  const channelId = extractYoutubeChannelId(input);
  if (channelId) return `https://www.youtube.com/channel/${channelId}/live`;
  const raw = String(input || "").trim();
  if (raw.startsWith("http")) return raw;
  return raw ? `https://${raw}` : null;
}
