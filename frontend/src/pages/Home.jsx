import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import ArticleCard from "../components/ArticleCard";
import AdBanner from "../components/AdBanner";
import FeaturedBanner from "../components/FeaturedBanner";
import TrendingSidebar from "../components/TrendingSidebar";
import LiveStreamView from "../components/LiveStreamView";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "../components/RoleBadge";
import socket from "../socket/socket";

function sortByNewest(list) {
  return [...list].sort(
    (a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
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
  const featured = filtered[0];
  const latestNews = filtered;
  const isLive = liveStream?.status === "live";
  const liveUrl = isLive ? liveStream?.streamUrl : liveStream?.recordingUrl;

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-400">
        Loading latest news…
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950">
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}{" "}
          <button type="button" onClick={() => loadFeed()} className="font-bold underline">Retry</button>
        </div>
      )}
      <AdBanner placement="header" className="border-b border-slate-200 dark:border-slate-800" />

      {breaking.length > 0 && (
        <div className="flex overflow-hidden bg-bbc-red text-white">
          <div className="shrink-0 bg-black/30 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest sm:px-4 sm:text-xs">
            {t("breaking")}
          </div>
          <div className="overflow-hidden">
            <div className="flex animate-[marquee_25s_linear_infinite] gap-8 py-2.5">
              {[...breaking, ...breaking].map((a, i) => (
                <Link key={`${a._id}-${i}`} to={`/article/${a.slug}`} className="whitespace-nowrap text-xs font-medium hover:underline sm:text-sm">
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {featured && <FeaturedBanner article={featured} />}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {user && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{user.name}</span>
            <RoleBadge role={user.role} />
            {isAdmin && (
              <Link to="/admin/publish" className="ml-auto bg-bbc-red px-3 py-1.5 text-xs font-bold text-white">
                {t("publish")}
              </Link>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <section className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="bbc-section-title text-xl dark:text-white sm:text-2xl">{t("latestNews")}</h2>
              <span className="text-xs text-slate-400 sm:text-sm">{latestNews.length} stories</span>
            </div>

            {latestNews.length === 0 ? (
              <p className="py-12 text-center text-slate-400">{t("noResults")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {latestNews.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5 lg:space-y-6">
            <TrendingSidebar articles={trending} />

            <section className="border border-slate-200 bg-bbc-grey p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="bbc-section-title text-base dark:text-white sm:text-lg">{t("liveTV")}</h2>
                {isLive && <span className="bbc-live-badge">Live</span>}
              </div>
              {liveStream ? (
                <>
                  <LiveStreamView stream={liveStream} url={liveUrl} mode="auto" className="mb-3" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">{liveStream.title}</h3>
                  <Link to="/live" className="mt-2 inline-block text-sm font-bold text-bbc-red hover:underline">
                    Watch full broadcast →
                  </Link>
                </>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-slate-200 text-xs text-slate-500 dark:bg-slate-800 sm:text-sm">
                  No broadcast scheduled
                </div>
              )}
            </section>

            <AdBanner placement="sidebar" />
          </aside>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {["all", "article", "video", "gallery"].map((type) => (
              <button
                key={type}
                onClick={() => setMediaFilter(type)}
                className={`shrink-0 px-4 py-1.5 text-sm font-semibold capitalize ${
                  mediaFilter === type
                    ? "bg-bbc-black text-white dark:bg-white dark:text-bbc-black"
                    : "border border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                }`}
              >
                {type === "all" ? "All" : type === "video" ? t("videoNews") : type === "gallery" ? t("photoGallery") : "Articles"}
              </button>
            ))}
          </div>

          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 px-3 py-1.5 text-sm font-medium ${
                selectedCategory === "all" ? "border-b-2 border-bbc-red font-bold text-bbc-red" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(c._id)}
                className={`shrink-0 px-3 py-1.5 text-sm font-medium ${
                  String(selectedCategory) === String(c._id) ? "border-b-2 border-bbc-red font-bold text-bbc-red" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
