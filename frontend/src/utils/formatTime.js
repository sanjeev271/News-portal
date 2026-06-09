export function formatTime(dateStr) {
  if (!dateStr) return "Just now";

  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString();
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
