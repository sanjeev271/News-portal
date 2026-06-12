const DEFAULTS = {
  title: "News Portal — Breaking News & Live Coverage",
  description: "Trusted news, live broadcasts, and in-depth reporting delivered in real time.",
  image: "/icons.svg",
  siteName: "News Portal",
};

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function applyPageSeo({
  title,
  description,
  image,
  url,
  type = "website",
  article,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${DEFAULTS.siteName}` : DEFAULTS.title;
  const desc = description || DEFAULTS.description;
  const img = image || DEFAULTS.image;
  const pageUrl = url || window.location.href;

  document.title = fullTitle;
  setMeta("name", "description", desc);
  setMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");
  setLink("canonical", pageUrl);

  setMeta("property", "og:title", fullTitle);
  setMeta("property", "og:description", desc);
  setMeta("property", "og:image", img.startsWith("http") ? img : `${window.location.origin}${img}`);
  setMeta("property", "og:url", pageUrl);
  setMeta("property", "og:type", type);
  setMeta("property", "og:site_name", DEFAULTS.siteName);

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", fullTitle);
  setMeta("name", "twitter:description", desc);
  setMeta("name", "twitter:image", img.startsWith("http") ? img : `${window.location.origin}${img}`);

  if (article) {
    setJsonLd("article-jsonld", {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.title,
      description: article.summary || desc,
      image: img,
      datePublished: article.publishedAt || article.createdAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: article.author?.name
        ? { "@type": "Person", name: article.author.name }
        : undefined,
      publisher: {
        "@type": "Organization",
        name: DEFAULTS.siteName,
      },
      mainEntityOfPage: pageUrl,
    });
  } else {
    const existing = document.getElementById("article-jsonld");
    if (existing) existing.remove();
  }
}

export function resetSeo() {
  applyPageSeo({});
}
