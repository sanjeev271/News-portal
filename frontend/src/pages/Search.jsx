import { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";

export default function Search() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await API.get(`/articles/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <h1 className="bbc-section-title mb-5 text-xl dark:text-white sm:mb-6 sm:text-2xl">{t("search")}</h1>

      <form onSubmit={search} className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
          className="min-h-[48px] flex-1 rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-bbc-red focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-red-900/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary min-h-[48px] w-full px-6 py-3 sm:w-auto"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {searched && results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-400 dark:border-slate-600">
          {t("noResults")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {results.map((a) => <ArticleCard key={a._id} article={a} />)}
      </div>
    </div>
  );
}
