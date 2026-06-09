const slugify = require("slugify");

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function normalizeContent(content, summary = "") {
  const text = (content || "").trim();
  if (!text) return `<p>${summary || "Full story coming soon."}</p>`;
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) {
    return text.split(/(?<=[.!?])\s+/).filter(Boolean).map((p) => `<p>${p}</p>`).join("");
  }
  return paragraphs.map((p) => `<p>${p}</p>`).join("");
}

function normalizeSummary(title, summary, content) {
  const clean = (summary || "").trim();
  if (clean.length >= 20) return clean.slice(0, 280);

  const fromContent = stripHtml(content || "");
  if (fromContent.length >= 20) return fromContent.slice(0, 280);

  return (title || "News update").slice(0, 280);
}

function defaultFeaturedImage(title, existing) {
  if (existing) return existing;
  const slug = slugify(title || "news", { lower: true, strict: true }).slice(0, 80);
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/675`;
}

function normalizeArticleFields(body, files, existing = {}) {
  const title = (body.title || existing.title || "").trim();
  const summary = normalizeSummary(title, body.summary, body.content);
  const content = normalizeContent(body.content, summary);

  let featuredImage = null;
  if (files?.featuredImage?.[0]) {
    const p = files.featuredImage[0].path.replace(/\\/g, "/");
    featuredImage = p.includes("/uploads/") ? p.slice(p.indexOf("uploads/")) : p;
  } else if (body.featuredImageUrl?.startsWith("http")) {
    featuredImage = body.featuredImageUrl.trim();
  } else if (body.status === "published" || body.status === "scheduled") {
    featuredImage = defaultFeaturedImage(title, existing.featuredImage);
  }

  return {
    title,
    summary,
    content,
    featuredImage,
    seoTitle: (body.seoTitle || title).trim(),
    seoDescription: (body.seoDescription || summary).trim().slice(0, 160),
  };
}

module.exports = {
  stripHtml,
  normalizeContent,
  normalizeSummary,
  defaultFeaturedImage,
  normalizeArticleFields,
};
