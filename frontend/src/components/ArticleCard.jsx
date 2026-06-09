import { Link } from "react-router-dom";
import { getImageUrl, formatTime } from "../utils/formatTime";

export default function ArticleCard({ article, featured = false, compact = false }) {
  const imageUrl = getImageUrl(article.featuredImage, article.title);

  if (featured) {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="card-surface group mb-8 grid overflow-hidden lg:grid-cols-5"
      >
        <div className={`relative overflow-hidden lg:col-span-3 ${compact ? "h-48" : "h-56 sm:h-72 lg:h-96"} ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}>
          {imageUrl && (
            <div
              className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          )}
          {article.isBreaking && (
            <span className="absolute left-3 top-3 rounded-full bg-bbc-red px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
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
          <h2 className="mb-3 text-2xl font-extrabold leading-tight text-slate-900 transition group-hover:text-bbc-red dark:text-white sm:text-3xl">
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
    <article className="card-surface group flex h-full flex-col overflow-hidden hover:-translate-y-0.5">
      <Link to={`/article/${article.slug}`} className="relative block overflow-hidden">
        <div className={`h-44 bg-cover bg-center transition duration-500 group-hover:scale-105 sm:h-48 ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
        />
        {article.isBreaking && (
          <span className="absolute left-2 top-2 rounded-full bg-bbc-red px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
            Breaking
          </span>
        )}
        {article.mediaType === "video" && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
            Video
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {article.category?.name && (
          <span className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-bbc-red">
            {article.category.name}
          </span>
        )}
        <h3 className="mb-2 flex-1 text-base font-bold leading-snug text-slate-900 dark:text-white">
          <Link to={`/article/${article.slug}`} className="transition hover:text-bbc-red">
            {article.title}
          </Link>
        </h3>
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{article.summary}</p>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-700/80">
          <span>{formatTime(article.createdAt)}</span>
          <Link to={`/article/${article.slug}`} className="font-bold text-bbc-red transition hover:underline">
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}
