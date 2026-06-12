import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import AdBanner from "../components/AdBanner";
import CommentBox from "../components/CommentBox";
import LikeButton from "../components/LikeButton";
import BookmarkButton from "../components/BookmarkButton";
import SocialShare from "../components/SocialShare";
import RelatedArticles from "../components/RelatedArticles";
import TrendingSidebar from "../components/TrendingSidebar";
import { ArticleSkeleton } from "../components/PageLoader";
import Badge from "../components/ui/Badge";
import PageContainer from "../components/ui/PageContainer";
import socket from "../socket/socket";
import { getImageUrl, formatTime } from "../utils/formatTime";
import { articleReadTime } from "../utils/readTime";
import { sanitizeArticleHtml } from "../utils/sanitizeHtml";
import { applyPageSeo } from "../utils/seo";
import { currentLocale, localizedCategoryName } from "../utils/localize";

export default function Article() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [article, setArticle] = useState(null);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get(`/articles/${slug}`),
      API.get("/articles/trending", { params: { locale: currentLocale() } }).catch(() => ({ data: [] })),
    ])
      .then(([articleRes, trendingRes]) => {
        setArticle(articleRes.data);
        setTrending((trendingRes.data || []).slice(0, 6));
        applyPageSeo({
          title: articleRes.data.seoTitle || articleRes.data.title,
          description: articleRes.data.seoDescription || articleRes.data.summary,
          image: articleRes.data.featuredImage ? getImageUrl(articleRes.data.featuredImage) : undefined,
          url: window.location.href,
          type: "article",
          article: articleRes.data,
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const onViewed = (data) =>
      setArticle((prev) => prev && data.articleId?.toString() === prev._id?.toString() ? { ...prev, views: data.views } : prev);
    const onLiked = (data) =>
      setArticle((prev) => prev && data.articleId?.toString() === prev._id?.toString() ? { ...prev, likes: data.likes } : prev);
    socket.on("article_viewed", onViewed);
    socket.on("article_liked", onLiked);
    socket.on("like_updated", onLiked);
    return () => {
      socket.off("article_viewed", onViewed);
      socket.off("article_liked", onLiked);
      socket.off("like_updated", onLiked);
    };
  }, []);

  if (loading) return <ArticleSkeleton />;
  if (!article) {
    return (
      <div className="empty-state mx-auto my-16 max-w-lg">
        <p className="text-body-sm text-slate-600 dark:text-slate-400">{t("noResults")}</p>
        <Link to="/" className="btn-primary mt-6">{t("home")}</Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(article.featuredImage, article.title);
  const videoUrl = getImageUrl(article.videoUrl);
  const safeContent = sanitizeArticleHtml(article.content);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const readMin = articleReadTime(article);

  return (
    <div className="animate-fade-up bg-white dark:bg-slate-950">
      <PageContainer className="py-6 sm:py-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <article className="min-w-0 lg:col-span-8">
            <nav className="text-meta mb-6 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
              <Link to="/" className="font-semibold text-link hover:text-link-hover">{t("home")}</Link>
              {article.category && (
                <>
                  <span aria-hidden>/</span>
                  <Link to={`/category/${article.category.slug}`} className="hover:text-slate-700 dark:hover:text-slate-300">
                    {localizedCategoryName(article.category)}
                  </Link>
                </>
              )}
            </nav>

            <header className="mb-8 max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                {article.isBreaking && <Badge variant="breaking">{t("breaking")}</Badge>}
                {article.category && <Badge variant="category">{localizedCategoryName(article.category)}</Badge>}
                {article.mediaType === "video" && <Badge variant="video">{t("videoNews")}</Badge>}
              </div>

              <h1 className="text-display text-slate-900 dark:text-white">
                {article.title}
              </h1>

              {article.summary && (
                <p className="text-body mt-4 text-slate-600 dark:text-slate-400">
                  {article.summary}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 pb-6 dark:border-slate-800">
                {article.author?._id && (
                  <Link to={`/author/${article.author._id}`} className="flex items-center gap-2 font-semibold text-slate-900 hover:text-link dark:text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-news-red text-xs font-bold text-white">
                      {article.author.name?.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </span>
                    {article.author.name}
                  </Link>
                )}
                <time className="text-meta">{formatTime(article.publishedAt || article.createdAt)}</time>
                <span className="text-meta">{readMin} min read</span>
                <span className="text-meta">{article.views} {t("views")}</span>
              </div>
            </header>

            {videoUrl ? (
              <div className="media-frame mb-8">
                <video src={videoUrl} controls className="w-full" playsInline />
              </div>
            ) : imageUrl ? (
              <figure className="media-frame mb-8 overflow-hidden">
                <img src={imageUrl} alt="" className="aspect-video w-full object-cover sm:aspect-[16/9]" />
              </figure>
            ) : null}

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-md border border-slate-200 p-1 dark:border-slate-700">
                <span className="text-meta px-2">A</span>
                {[0.9, 1, 1.15].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setFontScale(scale)}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      fontScale === scale
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                    aria-label={`Font size ${scale}`}
                  >
                    {scale === 0.9 ? "S" : scale === 1 ? "M" : "L"}
                  </button>
                ))}
              </div>
              <BookmarkButton articleId={article._id} />
            </div>

            <div
              className="article-prose"
              style={{ fontSize: `${fontScale}rem` }}
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            {article.gallery?.length > 0 && (
              <div className="my-10">
                <h2 className="section-title mb-5">{t("photoGallery")}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {article.gallery.map((img, i) => (
                    <figure key={i} className="overflow-hidden rounded-lg">
                      <img src={getImageUrl(img.url)} alt={img.caption || ""} className="w-full object-cover" loading="lazy" />
                      {img.caption && <figcaption className="text-caption mt-2">{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {article.keywords?.length > 0 && (
              <div className="my-8 flex flex-wrap gap-2">
                {article.keywords.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tag/${encodeURIComponent(tag)}`}
                    className="badge-muted transition hover:border-news-red hover:text-news-red"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="my-8 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <SocialShare title={article.title} url={shareUrl} />
            </div>

            <div className="my-8 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
              <LikeButton articleId={article._id} initialLikes={article.likes ?? 0} onLiked={(likes) => setArticle((p) => ({ ...p, likes }))} />
              <BookmarkButton articleId={article._id} />
            </div>

            <RelatedArticles slug={slug} />
            <CommentBox articleId={article._id} articleSlug={article.slug} />
          </article>

          <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <div className="hidden lg:block">
              <SocialShare title={article.title} url={shareUrl} vertical />
            </div>
            <TrendingSidebar articles={trending} />
            <AdBanner placement="sidebar" />
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}
