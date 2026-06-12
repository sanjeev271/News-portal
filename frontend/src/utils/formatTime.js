import i18n from "../i18n";

export function formatClockTime(dateStr) {
  if (!dateStr) return "";
  const locale = i18n.language === "ne" ? "ne-NP" : "en-GB";
  return new Date(dateStr).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return i18n.t("justNow");

  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return i18n.t("justNow");
  if (mins < 60) return i18n.t("minutesAgo", { count: mins });

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return i18n.t("hoursAgo", { count: hrs });

  const days = Math.floor(hrs / 24);
  if (days < 7) return i18n.t("daysAgo", { count: days });

  const locale = i18n.language === "ne" ? "ne-NP" : "en-GB";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function defaultImageForTitle(title) {
  const slug = (title || "news").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/675`;
}

export function getImageUrl(path, fallbackTitle) {
  if (!path) return fallbackTitle ? defaultImageForTitle(fallbackTitle) : null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/\\/g, "/").replace(/^\//, "");
  return `/${clean}`;
}
