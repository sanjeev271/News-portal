import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";
import Pagination from "../components/ui/Pagination";
import { applyPageSeo } from "../utils/seo";
import { currentLocale, localizedCategoryName } from "../utils/localize";

export default function Category() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
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
          return null;
        }
        setCategory(match);
        applyPageSeo({ title: localizedCategoryName(match), description: match.description });
        return API.get("/articles", { params: { categorySlug: slug, page, limit: 12, locale: currentLocale() } });
      })
      .then((res) => {
        if (!res) return;
        setArticles(res.data.articles || res.data);
        setPages(res.data.pages || 1);
        setTotal(res.data.total ?? res.data.length ?? 0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load category");
      })
      .finally(() => setLoading(false));
  }, [slug, page, i18n.language]);

  return (
    <div className="bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-bbc-grey px-4 py-6 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="text-sm font-bold text-bbc-red hover:underline">
            ← {t("home")}
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold dark:text-white sm:text-3xl">
            {category ? localizedCategoryName(category) : slug}
          </h1>
          {category?.description && (
            <p className="mt-2 text-slate-600 dark:text-slate-400">{category.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <p className="text-center text-slate-400">{t("loading")}</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : articles.length === 0 ? (
          <p className="py-12 text-center text-slate-400">{t("noResults")}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-slate-500">{total} {t("stories")}</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
            <Pagination page={page} pages={pages} total={total} className="mt-10" />
          </>
        )}
      </div>
    </div>
  );
}
