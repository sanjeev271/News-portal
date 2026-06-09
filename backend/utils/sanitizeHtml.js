const sanitizeHtml = require("sanitize-html");

const ARTICLE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "h3",
    "figure",
    "figcaption",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

function sanitizeArticleHtml(html = "") {
  return sanitizeHtml(String(html), ARTICLE_OPTIONS).trim();
}

function sanitizePlainText(text = "", maxLen = 2000) {
  return sanitizeHtml(String(text), { allowedTags: [], allowedAttributes: {} })
    .trim()
    .slice(0, maxLen);
}

module.exports = { sanitizeArticleHtml, sanitizePlainText };
