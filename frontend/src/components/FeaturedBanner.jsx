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
      <div className={`min-h-[240px] sm:min-h-[380px] lg:min-h-[520px] ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}>
        {imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl animate-fade-up">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {article.isBreaking && (
              <span className="rounded-full bg-bbc-red px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-lg">
                Breaking
              </span>
            )}
            {article.category?.name && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                {article.category.name}
              </span>
            )}
          </div>
          <h1 className="max-w-4xl text-xl font-extrabold leading-[1.2] text-white sm:text-4xl lg:text-5xl">
            <span className="transition group-hover:text-red-100">{article.title}</span>
          </h1>
          <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base lg:line-clamp-3">
            {article.summary}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-300 sm:text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">{article.views ?? 0} views</span>
            <span>{formatTime(article.createdAt)}</span>
            <span className="font-bold text-white underline-offset-4 transition group-hover:underline">
              Read full story →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
