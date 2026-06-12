import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";
import PageContainer from "../components/ui/PageContainer";
import Pagination from "../components/ui/Pagination";
import { applyPageSeo } from "../utils/seo";

const SORT_OPTIONS = [
  { value: "publishedAt", label: "Newest" },
  { value: "views", label: "Most viewed" },
  { value: "likes", label: "Most liked" },
];

const TYPE_FILTERS = [
  { value: "articles", label: "Articles" },
  { value: "liveEvents", label: "Live Events" },
  { value: "categories", label: "Categories" },
  { value: "tags", label: "Tags" },
  { value: "reporters", label: "Reporters" },
];

const DEFAULT_TYPES = ["articles", "liveEvents", "categories", "tags", "reporters"];

function countResults(results) {
  if (!results) return 0;
  return (
    (results.articles?.length || 0) +
    (results.liveEvents?.length || 0) +
    (results.liveUpdates?.length || 0) +
    (results.categories?.length || 0) +
    (results.tags?.length || 0) +
    (results.reporters?.length || 0)
  );
}

export default function Search() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState({});
  const [totals, setTotals] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState(searchParams.get("sort") || "publishedAt");
  const [types, setTypes] = useState(
    searchParams.get("types")?.split(",").filter(Boolean) || DEFAULT_TYPES
  );
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    applyPageSeo({ title: t("searchNav"), description: t("search") });
    API.get("/search/trending").then((r) => setTrending(r.data || [])).catch(() => {});
  }, [t]);

  const runSearch = useCallback(async (query, pageNum, sortVal, typesVal) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const res = await API.get("/search", {
        params: {
          q: trimmed,
          page: pageNum,
          limit: 12,
          sort: sortVal,
          types: typesVal.join(","),
        },
      });
      setResults(res.data.results || {});
      setTotals(res.data.totals || {});
      setTotal(res.data.total ?? 0);
      setPage(res.data.page || pageNum);
      setPages(res.data.pages || 1);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
      setResults({});
      setTotals({});
      setTotal(0);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const query = searchParams.get("q");
    if (!query) return;

    const pageNum = parseInt(searchParams.get("page") || "1", 10);
    const sortVal = searchParams.get("sort") || "publishedAt";
    const typesVal = searchParams.get("types")?.split(",").filter(Boolean) || DEFAULT_TYPES;

    setQ(query);
    setSort(sortVal);
    setTypes(typesVal);
    runSearch(query, pageNum, sortVal, typesVal);
  }, [searchParams, runSearch]);

  const search = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearchParams({ q: q.trim(), sort, types: types.join(","), page: "1" });
  };

  const onPageChange = (p) => {
    setSearchParams({ q: q.trim(), sort, types: types.join(","), page: String(p) });
  };

  const articles = results.articles || [];
  const liveEvents = results.liveEvents || [];
  const categories = results.categories || [];
  const tags = results.tags || [];
  const reporters = results.reporters || [];
  const resultCount = countResults(results);
  const hasResults = resultCount > 0 || total > 0;

  return (
    <div className="animate-fade-up section-band min-h-[60vh]">
      <PageContainer narrow>
        <h1 className="section-title mb-2">{t("searchNav")}</h1>
        <p className="text-body-sm mb-8 text-slate-500">{t("search")}</p>

        <form onSubmit={search} className="mb-8 space-y-3">
          <div className="relative">
            <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="input-field !py-3.5 !pl-12 text-base"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field sm:max-w-[200px]">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((tf) => (
                <label key={tf.value} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={types.includes(tf.value)}
                    onChange={(e) => {
                      setTypes((prev) =>
                        e.target.checked ? [...prev, tf.value] : prev.filter((x) => x !== tf.value)
                      );
                    }}
                    className="rounded border-slate-300"
                  />
                  {tf.label}
                </label>
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary min-h-[48px] flex-1 sm:flex-none sm:px-8">
              {loading ? t("loading") : t("searchNav")}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {!searched && trending.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{t("trendingSearches")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {trending.map((item) => (
                <button
                  key={item.query}
                  type="button"
                  onClick={() => {
                    setQ(item.query);
                    setSearchParams({ q: item.query, sort, types: types.join(",") });
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-bbc-red dark:border-slate-700"
                >
                  {item.query}
                </button>
              ))}
            </div>
          </section>
        )}

        {searched && !loading && !hasResults && !error && (
          <div className="empty-state">
            <p className="text-body-sm font-semibold text-slate-700 dark:text-slate-300">{t("noResults")}</p>
          </div>
        )}

        {searched && hasResults && (
          <p className="text-meta mb-6">{total || resultCount} {t("resultsFound")}</p>
        )}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="news-card overflow-hidden">
                <div className="skeleton aspect-[16/10]" />
                <div className="space-y-2 p-4">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && articles.length > 0 && (
          <section className="mb-10">
            <h2 className="bbc-section-title mb-4 text-lg">{t("articlesLabel")} ({totals.articles ?? articles.length})</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} highlight={a.highlight} />
              ))}
            </div>
            <Pagination page={page} pages={pages} total={totals.articles} onPageChange={onPageChange} className="mt-8" />
          </section>
        )}

        {!loading && liveEvents.length > 0 && (
          <section className="mb-10">
            <h2 className="bbc-section-title mb-4 text-lg">{t("liveEvents")}</h2>
            <ul className="space-y-3">
              {liveEvents.map((e) => (
                <li key={e._id}>
                  <Link to={`/live-event/${e.slug}`} className="block rounded-lg border border-slate-200 p-4 hover:border-bbc-red dark:border-slate-700">
                    <span className="font-bold dark:text-white">{e.title}</span>
                    {e.location && <span className="ml-2 text-sm text-slate-500">· {e.location}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!loading && categories.length > 0 && (
          <section className="mb-8">
            <h2 className="bbc-section-title mb-3 text-lg">{t("categories")}</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link key={c._id} to={`/category/${c.slug}`} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium dark:bg-slate-800">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {!loading && tags.length > 0 && (
          <section className="mb-8">
            <h2 className="bbc-section-title mb-3 text-lg">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tagItem) => (
                <Link key={tagItem.tag} to={`/tag/${encodeURIComponent(tagItem.tag)}`} className="rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-slate-700">
                  #{tagItem.tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        {!loading && reporters.length > 0 && (
          <section className="mb-8">
            <h2 className="bbc-section-title mb-3 text-lg">{t("reporters")}</h2>
            <ul className="space-y-2">
              {reporters.map((r) => (
                <li key={r._id}>
                  <Link to={`/author/${r._id}`} className="font-medium text-bbc-red hover:underline">{r.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageContainer>
    </div>
  );
}
