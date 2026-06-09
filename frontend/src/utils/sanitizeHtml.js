import DOMPurify from "dompurify";

const ARTICLE_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "b", "i", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "blockquote", "a", "img",
    "figure", "figcaption", "span", "div",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeArticleHtml(html = "") {
  if (!html) return "";
  return DOMPurify.sanitize(html, ARTICLE_CONFIG);
}
