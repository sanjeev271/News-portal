import { useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import API from "../api/axios";

import ArticleCard from "../components/ArticleCard";

import AdBanner from "../components/AdBanner";

import HeroSection from "../components/HeroSection";

import TopStoriesGrid from "../components/TopStoriesGrid";

import CategorySectionBlock from "../components/CategorySectionBlock";

import VideoNewsSection from "../components/VideoNewsSection";

import OpinionSection from "../components/OpinionSection";

import TrendingSidebar from "../components/TrendingSidebar";

import LiveUpdatesSection from "../components/LiveUpdatesSection";

import LiveStreamView from "../components/LiveStreamView";

import LiveBroadcastBar from "../components/LiveBroadcastBar";

import BreakingTicker from "../components/BreakingTicker";

import PageContainer from "../components/ui/PageContainer";

import NewsletterSignup from "../components/NewsletterSignup";

import { PRIMARY_NAV_SLUGS } from "../components/PrimaryNav";

import { HomeSkeleton } from "../components/PageLoader";

import { usePaginatedArticles } from "../hooks/usePaginatedArticles";

import Pagination from "../components/ui/Pagination";

import socket from "../socket/socket";

import { currentLocale, dedupeById } from "../utils/localize";



function sortByNewest(list) {

  return [...list].sort(

    (a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)

  );

}



export default function Home() {

  const { t, i18n } = useTranslation();

  const [previewArticles, setPreviewArticles] = useState([]);

  const [trending, setTrending] = useState([]);

  const [categories, setCategories] = useState([]);

  const [liveStream, setLiveStream] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [breakingAlerts, setBreakingAlerts] = useState([]);

  const [liveEvents, setLiveEvents] = useState([]);



  const { articles: feedArticles, loading: feedLoading, page, pages, total: feedTotal, setPage: loadFeedPage, prependArticle } =

    usePaginatedArticles({ limit: 12 });



  const loadMeta = useCallback(() => {

    const locale = currentLocale();

    return Promise.all([

      API.get("/articles", { params: { page: 1, limit: 40, locale } }),

      API.get("/categories"),

      API.get("/articles/trending", { params: { locale } }),

      API.get("/live/active").catch(() => ({ data: null })),

      API.get("/breaking/active").catch(() => ({ data: [] })),

      API.get("/live-events", { params: { live: "true", locale } }).catch(() => ({ data: [] })),

    ])

      .then(([a, c, tr, live, breakingRes, eventsRes]) => {

        setPreviewArticles(sortByNewest(a.data.articles || a.data));

        setCategories(c.data);

        setTrending(dedupeById(tr.data).slice(0, 8));

        setLiveStream(live.data);

        setBreakingAlerts(breakingRes.data || []);

        setLiveEvents(eventsRes.data || []);

        setError("");

      })

      .catch(() => setError(t("feedError")));

  }, [t]);



  useEffect(() => {

    setLoading(true);

    loadMeta().finally(() => setLoading(false));



    const onNewArticle = (data) => {

      if (data.status !== "published") return;

      if (data.locale && data.locale !== currentLocale()) return;

      setPreviewArticles((prev) => sortByNewest([data, ...prev.filter((a) => a._id !== data._id)]));

      prependArticle(data);

    };

    const onLiveStatus = (data) => setLiveStream(data);

    const onBreaking = (data) => {

      setBreakingAlerts((prev) => [data, ...prev.filter((b) => b._id !== data._id)].slice(0, 10));

    };

    const onLiveStarted = (data) => {

      if (data.slug) setLiveEvents((prev) => [data, ...prev.filter((e) => e._id !== data._id)]);

    };



    socket.on("new_article", onNewArticle);

    socket.on("article_published", onNewArticle);

    socket.on("breaking_news", onBreaking);

    socket.on("live_started", onLiveStarted);

    socket.on("live_status", onLiveStatus);

    window.addEventListener("focus", loadMeta);



    return () => {

      socket.off("new_article", onNewArticle);

      socket.off("article_published", onNewArticle);

      socket.off("breaking_news", onBreaking);

      socket.off("live_started", onLiveStarted);

      socket.off("live_status", onLiveStatus);

      window.removeEventListener("focus", loadMeta);

    };

  }, [loadMeta, prependArticle, i18n.language]);



  const breakingArticles = previewArticles.filter((a) => a.isBreaking);

  const breaking = dedupeById([

    ...breakingAlerts.map((b) => ({ _id: b._id || b.title, title: b.title, slug: b.link?.replace("/article/", "") || null, isExternal: !!b.link && !b.link.startsWith("/article/"), link: b.link })),

    ...breakingArticles.map((a) => ({ ...a, isExternal: false })),

  ]);

  const isLive = liveStream?.status === "live";



  const { heroMain, heroSecondary, topStories, categoryBlocks, videoArticles, opinionArticles, opinionCategory } =

    useMemo(() => {

      const used = new Set();

      const main =

        previewArticles.find((a) => a.isBreaking) ||

        previewArticles.find((a) => a.isFeatured) ||

        previewArticles[0] ||

        null;

      if (main) used.add(main._id);



      const secondary = previewArticles.filter((a) => !used.has(a._id)).slice(0, 4);

      secondary.forEach((a) => used.add(a._id));



      const top = previewArticles.filter((a) => !used.has(a._id) && (a.isFeatured || a.isBreaking)).slice(0, 4);

      if (top.length < 4) {

        previewArticles

          .filter((a) => !used.has(a._id))

          .slice(0, 4 - top.length)

          .forEach((a) => {

            top.push(a);

            used.add(a._id);

          });

      }



      const blocks = PRIMARY_NAV_SLUGS.filter((s) => s !== "opinion").map((slug) => {

        const cat = categories.find((c) => c.slug === slug);

        if (!cat) return null;

        const items = previewArticles.filter((a) => a.category?.slug === slug);

        return items.length ? { category: cat, articles: items } : null;

      }).filter(Boolean);



      const videos = previewArticles.filter((a) => a.mediaType === "video");

      const opinionCat = categories.find((c) => c.slug === "opinion");

      const opinion = previewArticles.filter((a) => a.category?.slug === "opinion");



      return {

        heroMain: main,

        heroSecondary: secondary,

        topStories: top,

        categoryBlocks: blocks,

        videoArticles: videos,

        opinionArticles: opinion,

        opinionCategory: opinionCat,

      };

    }, [previewArticles, categories]);



  if (loading) return <HomeSkeleton />;



  return (

    <div className="animate-fade-up overflow-x-hidden">

      {error && (

        <div className="border-b border-red-200 bg-red-50 px-3 py-3 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 sm:px-4">

          {error}{" "}

          <button type="button" onClick={loadMeta} className="touch-target font-bold underline">{t("retry")}</button>

        </div>

      )}



      <div className="bbc-page-accent" />

      <AdBanner placement="header" className="border-b border-slate-200 dark:border-slate-800" />

      <LiveBroadcastBar stream={liveStream} />

      <BreakingTicker items={breaking} />



      <HeroSection main={heroMain} secondary={heroSecondary} />

      <TopStoriesGrid articles={topStories} />



      <LiveUpdatesSection liveEvents={liveEvents} />



      <section className="section-band bbc-home-feed">

        <PageContainer>

          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-10">

            <div className="lg:col-span-8">

              <header className="bbc-section-header mb-6">

                <h2 className="bbc-section-heading">{t("latestNews")}</h2>

                <span className="bbc-section-rule" aria-hidden />

              </header>

              {feedLoading && feedArticles.length === 0 ? (

                <div className="py-12 text-center text-slate-400">{t("loading")}</div>

              ) : (

                <>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">

                    {feedArticles.map((a) => (

                      <ArticleCard key={a._id} article={a} />

                    ))}

                  </div>

                  <Pagination

                    page={page}

                    pages={pages}

                    total={feedTotal}

                    onPageChange={loadFeedPage}

                    className="mt-8"

                  />

                </>

              )}

            </div>



            <aside className="space-y-5 lg:col-span-4 lg:sticky lg:top-36 lg:self-start">

              <TrendingSidebar articles={trending} />

              <section className="sidebar-card bbc-sidebar-live">

                <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">

                  <h2 className="bbc-section-title text-base dark:text-white">{t("liveTV")}</h2>

                  {isLive && <span className="bbc-live-badge">{t("live")}</span>}

                </div>

                {liveStream ? (

                  <>

                    <div className="media-frame mb-3 hidden overflow-hidden sm:block">

                      <LiveStreamView stream={liveStream} mode="auto" />

                    </div>

                    <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">{liveStream.title}</h3>

                    <Link

                      to="/live-tv"

                      className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-bbc-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-bbc-red-dark sm:w-auto"

                    >

                      {t("watchFullBroadcast")} →

                    </Link>

                  </>

                ) : (

                  <div className="flex min-h-[80px] items-center justify-center rounded-md bg-slate-100 px-4 text-center text-sm text-slate-500 dark:bg-slate-800">

                    {t("noBroadcastScheduled")}

                  </div>

                )}

              </section>

              <AdBanner placement="sidebar" className="hidden sm:block" />

            </aside>

          </div>

        </PageContainer>

      </section>



      <div className="border-b border-slate-200 py-4 dark:border-slate-800">

        <PageContainer>

          <AdBanner placement="inline" />

        </PageContainer>

      </div>



      {categoryBlocks.map(({ category, articles }) => (

        <CategorySectionBlock key={category._id} category={category} articles={articles} />

      ))}



      <VideoNewsSection articles={videoArticles} />

      <OpinionSection articles={opinionArticles} category={opinionCategory} />

      <NewsletterSignup />

    </div>

  );

}

