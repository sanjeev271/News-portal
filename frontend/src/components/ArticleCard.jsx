import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl, formatTime } from "../utils/formatTime";
import { articleReadTime } from "../utils/readTime";
import { localizedCategoryName } from "../utils/localize";
import Badge from "./ui/Badge";
import BookmarkButton from "./BookmarkButton";

export default function ArticleCard({ article, featured = false, showBookmark = true, highlight }) {
  const { t } = useTranslation();
  const imageUrl = getImageUrl(article.featuredImage, article.title);
  const readMin = articleReadTime(article);
  const titleContent = highlight?.title ? { __html: highlight.title } : null;
  const summaryText = highlight?.summary ? null : article.summary;
  const summaryHtml = highlight?.summary ? { __html: highlight.summary } : null;

  if (featured) {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="news-card group mb-8 grid overflow-hidden lg:grid-cols-5"
      >
        <div className={`relative overflow-hidden lg:col-span-3 ${!imageUrl ? "bg-news-dark-grey" : ""} h-56 sm:h-72 lg:h-96`}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              aria-hidden
              className="h-full w-full object-cover transition duration-400 group-hover:scale-[1.02]"
              loading="lazy"
            />
          )}
          {article.isBreaking && (
            <span className="absolute left-3 top-3">
              <Badge variant="breaking">{t("breaking")}</Badge>
            </span>
          )}
        </div>
        <div className="flex flex-col justify-center p-6 lg:col-span-2 lg:p-8">
          {article.category && <Badge variant="category">{localizedCategoryName(article.category)}</Badge>}
          <h2 className="font-serif text-headline mt-2 mb-3 text-slate-900 transition group-hover:text-news-red dark:text-white">
            {article.title}
          </h2>
          <p className="text-body-sm mb-4 line-clamp-3 text-slate-600 dark:text-slate-400">{article.summary}</p>
          <div className="text-meta mt-auto flex flex-wrap gap-3">
            {article.author?.name && <span>{article.author.name}</span>}
            <span>{formatTime(article.publishedAt || article.createdAt)}</span>
            <span>{t("minRead", { count: readMin })}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="news-card group flex h-full min-w-0 flex-col overflow-hidden">
      <Link to={`/article/${article.slug}`} className="relative block w-full overflow-hidden">
        <div className={`relative aspect-[16/10] w-full ${!imageUrl ? "bg-news-dark-grey" : ""}`}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-400 group-hover:scale-[1.02]"
            />
          )}
        </div>
        {article.isBreaking && (
          <span className="absolute left-2 top-2">
            <Badge variant="breaking">{t("breaking")}</Badge>
          </span>
        )}
        {article.mediaType === "video" && (
          <span className="absolute bottom-2 right-2">
            <Badge variant="video">{t("videoNews")}</Badge>
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          {article.category?.name ? (
            <Badge variant="category">{localizedCategoryName(article.category)}</Badge>
          ) : (
            <span />
          )}
          {showBookmark && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <BookmarkButton articleId={article._id} compact />
            </div>
          )}
        </div>
        <h3 className="text-title mb-2 flex-1">
          <Link to={`/article/${article.slug}`} className="font-serif line-clamp-3 text-slate-900 transition hover:text-news-red dark:text-white">
            {titleContent ? <span dangerouslySetInnerHTML={titleContent} /> : article.title}
          </Link>
        </h3>
        {summaryHtml ? (
          <p className="text-body-sm mb-3 line-clamp-2 text-slate-500 dark:text-slate-400" dangerouslySetInnerHTML={summaryHtml} />
        ) : (
          <p className="text-body-sm mb-3 line-clamp-2 text-slate-500 dark:text-slate-400">{summaryText}</p>
        )}
        <div className="text-meta mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {article.author?.name && <span>{article.author.name}</span>}
            <time>{formatTime(article.publishedAt || article.createdAt)}</time>
            <span>{readMin} min</span>
          </div>
          <Link to={`/article/${article.slug}`} className="shrink-0 font-semibold text-link hover:text-link-hover">
            {t("readMore")} →
          </Link>
        </div>
      </div>
    </article>
  );
}
