import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../utils/formatTime";
import { dedupeById } from "../utils/localize";

export default function TrendingSidebar({ articles = [] }) {
  const { t } = useTranslation();
  const items = dedupeById(articles);

  if (!items.length) return null;

  return (
    <section className="sidebar-card">
      <h2 className="section-title mb-5 text-base">{t("trendingNews")}</h2>

      <ol className="hidden space-y-0 sm:block">
        {items.map((a, i) => (
          <li key={a._id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
            <Link
              to={`/article/${a.slug}`}
              className="group flex gap-3 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center text-sm font-bold tabular-nums text-news-red">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-title font-serif line-clamp-2 text-slate-900 transition group-hover:text-news-red dark:text-white">
                  {a.title}
                </p>
                <p className="text-meta mt-1">{a.views} {t("views")}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="chip-scroll pb-1 sm:hidden">
        {items.map((a, i) => {
          const imageUrl = getImageUrl(a.featuredImage, a.title);
          return (
            <Link
              key={a._id}
              to={`/article/${a.slug}`}
              className="news-card w-[72vw] max-w-[260px] shrink-0 snap-start overflow-hidden"
            >
              <div className={`relative aspect-[16/10] w-full ${!imageUrl ? "bg-news-dark-grey" : ""}`}>
                {imageUrl && (
                  <img src={imageUrl} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <span className="text-label text-news-red">#{i + 1}</span>
                <p className="text-title mt-1 line-clamp-2">{a.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link to="/trending" className="text-body-sm mt-4 inline-flex font-semibold text-link hover:text-link-hover">
        {t("viewAllTrending")} →
      </Link>
    </section>
  );
}
