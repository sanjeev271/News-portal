import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";
import { currentLocale, dedupeById } from "../utils/localize";

export default function Trending() {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const locale = currentLocale();
    API.get("/articles/trending", { params: { locale } })
      .then((r) => setArticles(dedupeById(r.data)))
      .catch(() => setArticles([]));
  }, [i18n.language]);

  return (
    <div className="bg-white dark:bg-slate-950">
      <div className="page-hero px-3 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="bbc-section-title text-xl dark:text-white sm:text-3xl">{t("trendingNews")}</h1>
          <p className="mt-1 text-slate-500">Most viewed stories right now</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {articles.map((a, i) => (
            <div key={a._id} className="relative">
              <span className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center bg-bbc-red text-sm font-black text-white">
                {i + 1}
              </span>
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
