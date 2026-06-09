import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";

export default function Trending() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    API.get("/articles/trending").then((r) => setArticles(r.data));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-bbc-grey px-4 py-6 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-extrabold dark:text-white sm:text-3xl">{t("trendingNews")}</h1>
          <p className="mt-1 text-slate-500">Most viewed stories right now</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
