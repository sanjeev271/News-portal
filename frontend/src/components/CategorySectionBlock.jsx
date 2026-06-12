import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl, formatTime } from "../utils/formatTime";
import { articleReadTime } from "../utils/readTime";
import { localizedCategoryName } from "../utils/localize";
import Badge from "./ui/Badge";
import PageContainer from "./ui/PageContainer";
import SectionHeader from "./ui/SectionHeader";

export default function CategorySectionBlock({ category, articles = [] }) {
  const { t } = useTranslation();
  if (!category || !articles.length) return null;

  const [lead, ...rest] = articles.slice(0, 3);

  return (
    <section className="section-band">
      <PageContainer>
        <SectionHeader
          title={localizedCategoryName(category)}
          href={`/category/${category.slug}`}
          linkLabel={t("viewAll")}
        />
        <div className="grid gap-6 lg:grid-cols-12">
          {lead && (
            <Link
              to={`/article/${lead.slug}`}
              className="news-card group overflow-hidden lg:col-span-5"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-800">
                {getImageUrl(lead.featuredImage, lead.title) && (
                  <img
                    src={getImageUrl(lead.featuredImage, lead.title)}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover transition duration-400 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                )}
                {lead.isBreaking && (
                  <span className="absolute left-3 top-3">
                    <Badge variant="breaking">{t("breaking")}</Badge>
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-serif text-headline line-clamp-3 text-slate-900 transition group-hover:text-news-red dark:text-white">
                  {lead.title}
                </h3>
                <p className="text-body-sm mt-2 line-clamp-2 text-slate-500">{lead.summary}</p>
                <div className="text-meta mt-3 flex gap-3">
                  <time>{formatTime(lead.publishedAt || lead.createdAt)}</time>
                  <span>{t("minRead", { count: articleReadTime(lead) })}</span>
                </div>
              </div>
            </Link>
          )}
          <div className="flex flex-col gap-4 lg:col-span-7">
            {rest.map((a) => (
              <Link
                key={a._id}
                to={`/article/${a.slug}`}
                className="group flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800"
              >
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-md bg-slate-200 dark:bg-slate-800 sm:w-28">
                  {getImageUrl(a.featuredImage, a.title) && (
                    <img
                      src={getImageUrl(a.featuredImage, a.title)}
                      alt=""
                      aria-hidden
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {a.isBreaking && <Badge variant="breaking">{t("breaking")}</Badge>}
                  <h3 className="text-title font-serif mt-1 line-clamp-2 text-slate-900 transition group-hover:text-news-red dark:text-white">
                    {a.title}
                  </h3>
                  <time className="text-meta mt-1 block">
                    {formatTime(a.publishedAt || a.createdAt)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
