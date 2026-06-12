export function estimateReadTime(text = "", wordsPerMinute = 220) {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return minutes;
}

export function articleReadTime(article) {
  const content = [article?.title, article?.summary, article?.content].filter(Boolean).join(" ");
  const plain = content.replace(/<[^>]+>/g, " ");
  return estimateReadTime(plain);
}
