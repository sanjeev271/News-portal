import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../utils/formatTime";

export default function TrendingSidebar({ articles = [] }) {
  const { t } = useTranslation();

  if (!articles.length) return null;

  return (
    <section className="sidebar-card">
      <h2 className="bbc-section-title mb-5 text-lg dark:text-white">{t("trendingNews")}</h2>

      <ol className="hidden space-y-1 sm:block">
        {articles.map((a, i) => (
          <li key={a._id}>
            <Link
              to={`/article/${a.slug}`}
              className="group flex gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-black text-bbc-red dark:bg-red-950/40">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition group-hover:text-bbc-red dark:text-white">
                  {a.title}
                </p>
                <p className="mt-1 text-xs text-slate-400">{a.views} views</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 sm:hidden">
        {articles.map((a, i) => {
          const imageUrl = getImageUrl(a.featuredImage, a.title);
          return (
            <Link
              key={a._id}
              to={`/article/${a.slug}`}
              className="w-44 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div
                className={`h-24 bg-cover bg-center ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}
                style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
              />
              <div className="p-2.5">
                <span className="text-xs font-black text-bbc-red">#{i + 1}</span>
                <p className="mt-1 line-clamp-2 text-xs font-bold text-slate-900 dark:text-white">{a.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link to="/trending" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-bbc-red transition hover:gap-2">
        View all trending →
      </Link>
    </section>
  );
}
