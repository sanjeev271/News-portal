export function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function normalizeContent(content, summary = "") {
  const text = (content || "").trim();
  if (!text) return `<p>${summary || "Full story coming soon."}</p>`;
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) {
    return text.split(/(?<=[.!?])\s+/).filter(Boolean).map((p) => `<p>${p}</p>`).join("");
  }
  return paragraphs.map((p) => `<p>${p}</p>`).join("");
}

export function normalizeSummary(title, summary, content) {
  const clean = (summary || "").trim();
  if (clean.length >= 20) return clean.slice(0, 280);

  const fromContent = stripHtml(content || "");
  if (fromContent.length >= 20) return fromContent.slice(0, 280);

  return (title || "News update").slice(0, 280);
}

export function defaultFeaturedImage(title) {
  const slug = (title || "news").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/675`;
}
