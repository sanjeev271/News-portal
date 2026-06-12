import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";
import { PageLoader } from "../components/PageLoader";

export default function Tag() {
  const { tag } = useParams();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/articles/tag/${encodeURIComponent(tag)}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [tag]);

  if (loading) return <PageLoader label={t("loading")} />;
  const label = decodeURIComponent(tag || "");

  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6">
      <h1 className="bbc-section-title mb-2 text-2xl dark:text-white">#{label}</h1>
      <p className="mb-8 text-sm text-slate-500">{data?.total || 0} {t("stories")}</p>
      {data?.articles?.length === 0 ? (
        <p className="text-slate-400">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      )}
      <Link to="/" className="mt-8 inline-block text-sm font-bold text-bbc-red hover:underline">← {t("home")}</Link>
    </div>
  );
}
