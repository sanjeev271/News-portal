import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import AdBanner from "../components/AdBanner";
import CommentBox from "../components/CommentBox";
import LikeButton from "../components/LikeButton";
import BookmarkButton from "../components/BookmarkButton";
import socket from "../socket/socket";
import { getImageUrl, formatTime } from "../utils/formatTime";

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

  if (loading) return <div className="flex min-h-64 items-center justify-center text-slate-400">Loading…</div>;
  if (!article) return <div className="py-16 text-center"><Link to="/" className="font-bold text-bbc-red">Go home</Link></div>;

  const imageUrl = getImageUrl(article.featuredImage, article.title);
  const videoUrl = getImageUrl(article.videoUrl);

  return (
    <div className="bg-white dark:bg-slate-950">
      <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Link to="/" className="text-sm font-bold text-bbc-red hover:underline">← Home</Link>

            <div className="mt-4 flex flex-wrap gap-2">
              {article.isBreaking && (
                <span className="bg-bbc-red px-2 py-0.5 text-xs font-black uppercase tracking-wider text-white">Breaking</span>
              )}
              {article.mediaType === "video" && (
                <span className="border border-slate-300 px-2 py-0.5 text-xs font-bold uppercase text-slate-600">Video</span>
              )}
              {article.mediaType === "gallery" && (
                <span className="border border-slate-300 px-2 py-0.5 text-xs font-bold uppercase text-slate-600">Gallery</span>
              )}
              {article.category?.name && (
                <span className="text-xs font-bold uppercase tracking-widest text-bbc-red">{article.category.name}</span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              By <span className="font-semibold text-slate-700 dark:text-slate-300">{article.author?.name}</span>
              {" · "}{article.views} views · {formatTime(article.createdAt)}
            </p>

            {videoUrl ? (
              <video src={videoUrl} controls className="my-6 w-full" />
            ) : (
              <div
                className={`my-6 h-64 bg-cover bg-center sm:h-96 ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}
                style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
              />
            )}

            {article.gallery?.length > 0 && (
              <div className="mb-6">
                <h3 className="bbc-section-title mb-4 text-lg dark:text-white">Photo Gallery</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {article.gallery.map((img, i) => (
                    <figure key={i}>
                      <img src={getImageUrl(img.url)} alt={img.caption || ""} className="w-full object-cover" />
                      {img.caption && <figcaption className="mt-1 text-sm text-slate-500">{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            )}

            <div
              className="prose prose-slate max-w-none text-lg leading-relaxed dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="my-8 flex flex-wrap items-center gap-4 border-y border-slate-200 py-5 dark:border-slate-700">
              <LikeButton articleId={article._id} initialLikes={article.likes ?? 0} onLiked={(likes) => setArticle((p) => ({ ...p, likes }))} />
              <BookmarkButton articleId={article._id} />
            </div>

            <CommentBox articleId={article._id} />
          </div>

          <aside className="space-y-6">
            <AdBanner placement="sidebar" />
            <AdBanner placement="inline" />
          </aside>
        </div>
      </article>
    </div>
  );
}
