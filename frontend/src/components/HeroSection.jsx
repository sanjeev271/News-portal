import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl, formatTime } from "../utils/formatTime";
import { articleReadTime } from "../utils/readTime";
import { localizedCategoryName } from "../utils/localize";
import Badge from "./ui/Badge";
import PageContainer from "./ui/PageContainer";

function SecondaryHeadline({ article }) {
  const { t } = useTranslation();
  const imageUrl = getImageUrl(article.featuredImage, article.title);
  const readMin = articleReadTime(article);

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex gap-4 border-t border-slate-200 py-4 first:border-t-0 dark:border-slate-800"
    >
      <div className="relative aspect-[4/3] w-[88px] shrink-0 overflow-hidden rounded-md bg-slate-200 dark:bg-slate-800 sm:w-[100px]">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        )}
        {article.isBreaking && (
          <span className="absolute left-1 top-1">
            <Badge variant="breaking">{t("breaking")}</Badge>
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {article.category && <Badge variant="category">{localizedCategoryName(article.category)}</Badge>}
        <h3 className="font-serif text-title mt-1 line-clamp-3 text-slate-900 transition group-hover:text-news-red dark:text-white">
          {article.title}
        </h3>
        <div className="text-meta mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {article.author?.name && <span>{article.author.name}</span>}
          <span aria-hidden>·</span>
          <time>{formatTime(article.publishedAt || article.createdAt)}</time>
          <span aria-hidden>·</span>
          <span>{t("minRead", { count: readMin })}</span>
        </div>
      </div>
    </Link>
  );
}

export default function HeroSection({ main, secondary = [] }) {
  const { t } = useTranslation();
  if (!main) return null;

  const imageUrl = getImageUrl(main.featuredImage, main.title);
  const readMin = articleReadTime(main);

  return (
    <section className="section-band bbc-hero border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <PageContainer className="p-0">
        <div className="grid gap-0 lg:grid-cols-12">
          <Link
            to={`/article/${main.slug}`}
            className="group relative overflow-hidden bg-news-black lg:col-span-7"
          >
            <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[16/10]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  loading="eager"
                />
              ) : (
                <div className="absolute inset-0 bg-news-dark-grey" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                <div className="mb-3 flex flex-wrap gap-2">
                  {main.isBreaking && <Badge variant="breaking">{t("breaking")}</Badge>}
                  {main.category && (
                    <span className="badge-muted bg-white/15 text-white backdrop-blur-sm">
                      {localizedCategoryName(main.category)}
                    </span>
                  )}
                </div>
                <h1 className="text-display line-clamp-4 max-w-4xl text-white">
                  {main.title}
                </h1>
                {main.summary && (
                  <p className="text-body-sm mt-3 line-clamp-2 max-w-2xl text-slate-300 sm:text-base">
                    {main.summary}
                  </p>
                )}
                <div className="text-meta mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400">
                  {main.author?.name && (
                    <span className="font-semibold text-white/90">{main.author.name}</span>
                  )}
                  <time>{formatTime(main.publishedAt || main.createdAt)}</time>
                  <span>{t("minRead", { count: readMin })}</span>
                </div>
              </div>
            </div>
          </Link>

          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800 lg:col-span-5 lg:border-l lg:border-t-0 lg:px-6 lg:py-6">
            <p className="text-label mb-3 text-slate-500">{t("topStories")}</p>
            {secondary.length === 0 ? (
              <p className="text-caption py-8">{t("noResults")}</p>
            ) : (
              secondary.map((a) => <SecondaryHeadline key={a._id} article={a} />)
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
