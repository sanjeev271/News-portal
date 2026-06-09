import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";

export default function Category() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    API.get("/categories")
      .then((res) => {
        const match = res.data.find((c) => c.slug === slug);
        if (!match) {
          setError("Category not found");
          setLoading(false);
          return;
        }
        setCategory(match);
        return API.get("/articles", { params: { category: match._id } });
      })
      .then((res) => {
        if (res) setArticles(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load category");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-bbc-grey px-4 py-6 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="text-sm font-bold text-bbc-red hover:underline">
            ← {t("home")}
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold dark:text-white sm:text-3xl">
            {category?.name || slug}
          </h1>
          {category?.description && (
            <p className="mt-2 text-slate-600 dark:text-slate-400">{category.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <p className="text-center text-slate-400">Loading…</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : articles.length === 0 ? (
          <p className="py-12 text-center text-slate-400">{t("noResults")}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-slate-500">{articles.length} stories</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
