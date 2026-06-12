import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl, formatTime } from "../utils/formatTime";
import PageContainer from "./ui/PageContainer";

export default function VideoNewsSection({ articles = [] }) {
  const { t } = useTranslation();
  if (!articles.length) return null;

  return (
    <section className="border-b border-slate-800 bg-news-black py-8 text-white sm:py-10">
      <PageContainer>
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="section-title !border-news-red !text-white">{t("videoNews")}</h2>
          <Link to="/search?q=video" className="text-body-sm font-semibold text-slate-300 hover:text-white">
            {t("viewAll")} →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((a) => {
            const imageUrl = getImageUrl(a.featuredImage, a.title);
            return (
              <Link key={a._id} to={`/article/${a.slug}`} className="group overflow-hidden rounded-lg bg-slate-900">
                <div className="relative aspect-video overflow-hidden">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt=""
                      aria-hidden
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  )}
                  <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-news-red px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    {t("videoNews")}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-title font-serif line-clamp-2 transition group-hover:text-slate-300">{a.title}</h3>
                  <time className="text-meta mt-2 block text-slate-500">{formatTime(a.publishedAt || a.createdAt)}</time>
                </div>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
