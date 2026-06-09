import { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";

export default function Search() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    const res = await API.get(`/articles/search?q=${encodeURIComponent(q)}`);
    setResults(res.data);
    setSearched(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold dark:text-white">{t("search")}</h1>
      <form onSubmit={search} className="mb-8 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
          className="flex-1 rounded-xl border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <button type="submit" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white">Search</button>
      </form>
      {searched && results.length === 0 && <p className="text-slate-400">{t("noResults")}</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((a) => <ArticleCard key={a._id} article={a} />)}
      </div>
    </div>
  );
}
