import { Link } from "react-router-dom";
import { getImageUrl, formatTime } from "../utils/formatTime";

export default function ArticleCard({ article, featured = false, compact = false }) {
  const imageUrl = getImageUrl(article.featuredImage, article.title);

  if (featured) {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group mb-8 grid overflow-hidden border border-slate-200 bg-white transition hover:border-bbc-red dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-5"
      >
        <div
          className={`relative lg:col-span-3 ${compact ? "h-48" : "h-56 sm:h-72 lg:h-96"} bg-cover bg-center ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
        >
          {article.isBreaking && (
            <span className="absolute left-0 top-0 bg-bbc-red px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white">
              Breaking
            </span>
          )}
        </div>
        <div className="flex flex-col justify-center p-6 lg:col-span-2 lg:p-8">
          {article.category?.name && (
            <span className="mb-2 text-xs font-bold uppercase tracking-widest text-bbc-red">
              {article.category.name}
            </span>
          )}
          <h2 className="mb-3 text-2xl font-extrabold leading-tight text-slate-900 group-hover:underline dark:text-white sm:text-3xl">
            {article.title}
          </h2>
          <p className="mb-4 line-clamp-3 text-slate-600 dark:text-slate-400">{article.summary}</p>
          <div className="mt-auto flex gap-4 text-xs text-slate-400">
            <span>{article.views ?? 0} views</span>
            <span>{formatTime(article.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition hover:border-bbc-red dark:border-slate-700 dark:bg-slate-900">
      <Link to={`/article/${article.slug}`} className="relative block">
        <div
          className={`h-40 bg-cover bg-center sm:h-44 md:h-48 ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
        />
        {article.isBreaking && (
          <span className="absolute left-0 top-0 bg-bbc-red px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            Breaking
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {article.category?.name && (
          <span className="mb-1 text-[11px] font-bold uppercase tracking-widest text-bbc-red">
            {article.category.name}
          </span>
        )}
        <h3 className="mb-2 flex-1 text-base font-bold leading-snug text-slate-900 dark:text-white">
          <Link to={`/article/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-slate-500">{article.summary}</p>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-700">
          <span>{formatTime(article.createdAt)}</span>
          <Link to={`/article/${article.slug}`} className="font-bold text-bbc-red hover:underline">
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}
