import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";
import { PageLoader } from "../components/PageLoader";

export default function Author() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/articles/author/${id}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label={t("loading")} />;
  if (!data?.author) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4">
        <p className="text-slate-500">{t("noResults")}</p>
        <Link to="/" className="btn-primary">{t("home")}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bbc-red text-xl font-black text-white">
          {data.author.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold dark:text-white">{data.author.name}</h1>
          <p className="text-sm capitalize text-slate-500">{data.author.role}</p>
          <p className="mt-1 text-sm text-slate-400">{data.total} {t("stories")}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.articles.map((a) => (
          <ArticleCard key={a._id} article={a} />
        ))}
      </div>
    </div>
  );
}
