import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";
import { useAuth } from "../context/AuthContext";

export default function Bookmarks() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (isLoggedIn) API.get("/bookmarks").then((r) => setArticles(r.data));
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500"><Link to="/login" className="text-blue-600 hover:underline">{t("login")}</Link> to view bookmarks</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-8 text-2xl font-bold dark:text-white">🔖 {t("bookmarks")}</h1>
      {articles.length === 0 ? (
        <p className="text-slate-400">No saved articles yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => <ArticleCard key={a._id} article={a} />)}
        </div>
      )}
    </div>
  );
}
