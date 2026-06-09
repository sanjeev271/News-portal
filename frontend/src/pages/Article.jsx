import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import AdBanner from "../components/AdBanner";
import CommentBox from "../components/CommentBox";
import LikeButton from "../components/LikeButton";
import BookmarkButton from "../components/BookmarkButton";
import { PageLoader } from "../components/PageLoader";
import socket from "../socket/socket";
import { getImageUrl, formatTime } from "../utils/formatTime";
import { sanitizeArticleHtml } from "../utils/sanitizeHtml";

export default function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/articles/${slug}`).then((r) => setArticle(r.data)).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const onViewed = (data) =>
      setArticle((prev) => prev && data.articleId?.toString() === prev._id?.toString() ? { ...prev, views: data.views } : prev);
    const onLiked = (data) =>
      setArticle((prev) => prev && data.articleId?.toString() === prev._id?.toString() ? { ...prev, likes: data.likes } : prev);
    socket.on("article_viewed", onViewed);
    socket.on("article_liked", onLiked);
    return () => {
      socket.off("article_viewed", onViewed);
      socket.off("article_liked", onLiked);
    };
  }, []);

  if (loading) return <PageLoader label="Loading article…" />;
  if (!article) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-500">Article not found</p>
        <Link to="/" className="btn-primary">Go home</Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(article.featuredImage, article.title);
  const videoUrl = getImageUrl(article.videoUrl);
  const safeContent = sanitizeArticleHtml(article.content);

  return (
    <div className="animate-fade-up bg-slate-50 dark:bg-slate-950">
      <article className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link to="/" className="font-semibold text-bbc-red hover:underline">Home</Link>
              {article.category?.name && (
                <>
                  <span>/</span>
                  <Link to={`/category/${article.category.slug}`} className="hover:text-slate-700 dark:hover:text-slate-300">
                    {article.category.name}
                  </Link>
                </>
              )}
            </nav>

            <div className="mb-4 flex flex-wrap gap-2">
              {article.isBreaking && (
                <span className="rounded-full bg-bbc-red px-3 py-0.5 text-xs font-black uppercase tracking-wider text-white">Breaking</span>
              )}
              {article.mediaType === "video" && (
                <span className="rounded-full border border-slate-300 px-3 py-0.5 text-xs font-bold uppercase text-slate-600 dark:border-slate-600 dark:text-slate-300">Video</span>
              )}
              {article.mediaType === "gallery" && (
                <span className="rounded-full border border-slate-300 px-3 py-0.5 text-xs font-bold uppercase text-slate-600 dark:border-slate-600 dark:text-slate-300">Gallery</span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{article.author?.name}</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" />
              <span>{article.views} views</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" />
              <span>{formatTime(article.createdAt)}</span>
            </div>

            {videoUrl ? (
              <div className="media-frame my-8">
                <video src={videoUrl} controls className="w-full" playsInline />
              </div>
            ) : (
              <div className={`media-frame my-8 overflow-hidden ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}>
                {imageUrl && (
                  <div
                    className="h-64 bg-cover bg-center sm:h-[28rem] lg:h-[32rem]"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                )}
              </div>
            )}

            {article.gallery?.length > 0 && (
              <div className="mb-8">
                <h3 className="bbc-section-title mb-4 text-lg dark:text-white">Photo Gallery</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {article.gallery.map((img, i) => (
                    <figure key={i} className="overflow-hidden rounded-xl">
                      <img src={getImageUrl(img.url)} alt={img.caption || ""} className="w-full object-cover transition hover:scale-[1.02]" />
                      {img.caption && <figcaption className="mt-2 text-sm text-slate-500">{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            )}

            <div
              className="prose prose-slate max-w-none leading-relaxed dark:prose-invert sm:prose-lg"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            <div className="my-10 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <LikeButton articleId={article._id} initialLikes={article.likes ?? 0} onLiked={(likes) => setArticle((p) => ({ ...p, likes }))} />
              <BookmarkButton articleId={article._id} />
            </div>

            <CommentBox articleId={article._id} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <AdBanner placement="sidebar" />
            <AdBanner placement="inline" />
          </aside>
        </div>
      </article>
    </div>
  );
}
