import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";
import AdBanner from "../components/AdBanner";
import FeaturedBanner from "../components/FeaturedBanner";
import TrendingSidebar from "../components/TrendingSidebar";
import LiveStreamView from "../components/LiveStreamView";
import { HomeSkeleton } from "../components/PageLoader";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "../components/RoleBadge";
import socket from "../socket/socket";

function sortByNewest(list) {
  return [...list].sort(
    (a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || b.createdAt)
  );
}

function mergeArticle(list, article) {
  const without = list.filter((a) => a._id !== article._id);
  return sortByNewest([article, ...without]);
}

export default function Home() {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const [articles, setArticles] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [liveStream, setLiveStream] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeed = useCallback(() => {
    return Promise.all([
      API.get("/articles"),
      API.get("/categories"),
      API.get("/articles/trending"),
      API.get("/live/active").catch(() => ({ data: null })),
    ]).then(([a, c, tr, live]) => {
      setArticles(sortByNewest(a.data));
      setCategories(c.data);
      setTrending(tr.data.slice(0, 8));
      setLiveStream(live.data);
      setError("");
    }).catch((err) => {
      setError(err.response?.data?.message || "Could not load news feed. Is the backend running on port 5000?");
    });
  }, []);

  useEffect(() => {
    loadFeed().finally(() => setLoading(false));

    const onNewArticle = (data) => {
      if (data.status !== "published") return;
      setArticles((prev) => mergeArticle(prev, data));
      setTrending((prev) => mergeArticle(prev, data).slice(0, 8));
    };
    const onLiveStatus = (data) => setLiveStream(data);

    socket.on("new_article", onNewArticle);
    socket.on("live_status", onLiveStatus);

    const onFocus = () => { loadFeed(); };
    window.addEventListener("focus", onFocus);

    return () => {
      socket.off("new_article", onNewArticle);
      socket.off("live_status", onLiveStatus);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadFeed]);

  const filtered = useMemo(() => {
    let list = articles;
    if (selectedCategory !== "all") {
      list = list.filter((a) => String(a.category?._id) === String(selectedCategory));
    }
    if (mediaFilter !== "all") {
      list = list.filter((a) => a.mediaType === mediaFilter);
    }
    return sortByNewest(list);
  }, [articles, selectedCategory, mediaFilter]);

  const breaking = articles.filter((a) => a.isBreaking);
  const featured = articles[0];
  const latestNews = filtered;
  const isLive = liveStream?.status === "live";

  if (loading) return <HomeSkeleton />;

  return (
    <div className="animate-fade-up">
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-3 py-3 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 sm:px-4">
          {error}{" "}
          <button type="button" onClick={() => loadFeed()} className="touch-target font-bold underline">Retry</button>
        </div>
      )}
      <AdBanner placement="header" className="border-b border-slate-200 dark:border-slate-800" />

      {breaking.length > 0 && (
        <div className="flex overflow-hidden bg-bbc-red text-white shadow-inner">
          <div className="flex shrink-0 items-center gap-1.5 bg-black/25 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest sm:gap-2 sm:px-4 sm:text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {t("breaking")}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-[marquee_20s_linear_infinite] gap-8 py-2.5 sm:animate-[marquee_25s_linear_infinite] sm:gap-10">
              {[...breaking, ...breaking].map((a, i) => (
                <Link
                  key={`${a._id}-${i}`}
                  to={`/article/${a.slug}`}
                  className="whitespace-nowrap py-1 text-xs font-medium transition active:underline sm:text-sm"
                >
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {featured && <FeaturedBanner article={featured} />}

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
        {user && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Hi, <strong>{user.name.split(" ")[0]}</strong>
            </span>
            <RoleBadge role={user.role} />
            {isAdmin && (
              <Link to="/admin/publish" className="btn-primary ml-auto text-xs">
                {t("publish")}
              </Link>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <section className="lg:col-span-2">
            <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
              <h2 className="bbc-section-title text-lg dark:text-white sm:text-2xl">{t("latestNews")}</h2>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 sm:px-3 sm:py-1 sm:text-xs">
                {latestNews.length} stories
              </span>
            </div>

            {latestNews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-600 sm:py-16">
                <p className="text-slate-400">{t("noResults")}</p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory("all"); setMediaFilter("all"); }}
                  className="touch-target mt-3 text-sm font-bold text-bbc-red"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {latestNews.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:space-y-6 lg:self-start">
            <TrendingSidebar articles={trending} />

            <section className="sidebar-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="bbc-section-title text-base dark:text-white">{t("liveTV")}</h2>
                {isLive && <span className="bbc-live-badge">Live</span>}
              </div>
              {liveStream ? (
                <>
                  <div className="media-frame mb-4 overflow-hidden">
                    <LiveStreamView stream={liveStream} mode="auto" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{liveStream.title}</h3>
                  <Link to="/live" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-bbc-red transition hover:gap-2">
                    Watch full broadcast →
                  </Link>
                </>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-800">
                  No broadcast scheduled
                </div>
              )}
            </section>

            <AdBanner placement="sidebar" />
          </aside>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="chip-scroll-fade mb-4">
            <div className="chip-scroll">
              {["all", "article", "video", "gallery"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMediaFilter(type)}
                  className={`chip ${mediaFilter === type ? "chip-active" : ""}`}
                >
                  {type === "all" ? "All" : type === "video" ? t("videoNews") : type === "gallery" ? t("photoGallery") : "Articles"}
                </button>
              ))}
            </div>
          </div>
          <div className="chip-scroll-fade">
            <div className="chip-scroll">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`chip ${selectedCategory === "all" ? "chip-active" : ""}`}
              >
                All categories
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelectedCategory(c._id)}
                  className={`chip ${String(selectedCategory) === String(c._id) ? "chip-active" : ""}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
