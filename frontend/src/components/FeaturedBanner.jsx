import { Link } from "react-router-dom";
import { getImageUrl, formatTime } from "../utils/formatTime";

export default function FeaturedBanner({ article }) {
  if (!article) return null;

  const imageUrl = getImageUrl(article.featuredImage, article.title);

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group relative block overflow-hidden bg-bbc-black"
    >
      <div
        className={`min-h-[280px] bg-cover bg-center sm:min-h-[360px] lg:min-h-[480px] ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {article.isBreaking && (
            <span className="mb-3 inline-block bg-bbc-red px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white">
              Breaking
            </span>
          )}
          {article.category?.name && (
            <span className="mb-3 ml-2 text-[11px] font-bold uppercase tracking-widest text-red-300">
              {article.category.name}
            </span>
          )}
          <h1 className="max-w-4xl text-2xl font-extrabold leading-tight text-white group-hover:underline sm:text-3xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm text-slate-200 sm:text-base lg:line-clamp-3">
            {article.summary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300 sm:text-sm">
            <span>{article.views ?? 0} views</span>
            <span>·</span>
            <span>{formatTime(article.createdAt)}</span>
            <span className="font-bold text-white group-hover:underline">Read full story →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
