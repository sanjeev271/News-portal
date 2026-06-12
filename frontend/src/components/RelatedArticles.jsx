import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { formatTime } from "../utils/formatTime";

export default function RelatedArticles({ slug }) {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (!slug) return;
    API.get(`/articles/related/${slug}`)
      .then((r) => setArticles(r.data))
      .catch(() => setArticles([]));
  }, [slug]);

  if (!articles.length) return null;

  return (
    <section className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-700">
      <h2 className="bbc-section-title mb-5 text-lg dark:text-white">{t("relatedArticles")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a._id}
            to={`/article/${a.slug}`}
            className="group rounded-xl border border-slate-200 p-4 transition hover:border-bbc-red/40 dark:border-slate-700"
          >
            {a.category?.name && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-bbc-red">{a.category.name}</span>
            )}
            <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-slate-900 group-hover:text-bbc-red dark:text-white">
              {a.title}
            </h3>
            <time className="mt-2 block text-xs text-slate-400">{formatTime(a.publishedAt || a.createdAt)}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}
