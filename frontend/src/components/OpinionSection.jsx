import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatTime } from "../utils/formatTime";
import PageContainer from "./ui/PageContainer";
import SectionHeader from "./ui/SectionHeader";

export default function OpinionSection({ articles = [], category }) {
  const { t } = useTranslation();
  if (!articles.length) return null;

  return (
    <section className="section-band section-band-alt">
      <PageContainer>
        <SectionHeader
          title={t("opinionAnalysis")}
          href={category ? `/category/${category.slug}` : undefined}
          linkLabel={t("viewAll")}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {articles.slice(0, 4).map((a) => (
            <Link
              key={a._id}
              to={`/article/${a.slug}`}
              className="news-card group flex gap-4 p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {a.author?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-meta font-semibold">{a.author?.name}</p>
                <h3 className="text-title font-serif mt-1 line-clamp-2 text-slate-900 transition group-hover:text-news-red dark:text-white">
                  {a.title}
                </h3>
                <time className="text-meta mt-2 block">{formatTime(a.publishedAt || a.createdAt)}</time>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
