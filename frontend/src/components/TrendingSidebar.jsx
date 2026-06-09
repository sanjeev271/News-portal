import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../utils/formatTime";

export default function TrendingSidebar({ articles = [] }) {
  const { t } = useTranslation();

  if (!articles.length) return null;

  return (
    <section className="border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <h2 className="bbc-section-title mb-4 text-lg dark:text-white">{t("trendingNews")}</h2>

      {/* Desktop / tablet list */}
      <ol className="hidden space-y-4 sm:block">
        {articles.map((a, i) => (
          <li key={a._id} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 dark:border-slate-800">
            <span className="text-2xl font-black leading-none text-bbc-red">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <Link
                to={`/article/${a.slug}`}
                className="line-clamp-3 text-sm font-bold leading-snug text-slate-900 hover:underline dark:text-white"
              >
                {a.title}
              </Link>
              <p className="mt-1 text-xs text-slate-400">{a.views} views</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Mobile horizontal scroll cards */}
      <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 sm:hidden">
        {articles.map((a, i) => {
          const imageUrl = getImageUrl(a.featuredImage, a.title);
          return (
            <Link
              key={a._id}
              to={`/article/${a.slug}`}
              className="w-44 shrink-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            >
              <div
                className={`h-24 bg-cover bg-center ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}
                style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
              />
              <div className="p-2">
                <span className="text-xs font-black text-bbc-red">#{i + 1}</span>
                <p className="mt-1 line-clamp-2 text-xs font-bold text-slate-900 dark:text-white">{a.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link to="/trending" className="mt-3 inline-block text-sm font-bold text-bbc-red hover:underline">
        View all trending →
      </Link>
    </section>
  );
}
