import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BreakingTicker({ items = [] }) {
  const { t } = useTranslation();
  if (!items.length) return null;

  return (
    <div className="breaking-ticker flex overflow-hidden border-b border-news-red-dark bg-news-red text-white" role="marquee" aria-label={t("breaking")}>
      <div className="flex shrink-0 items-center gap-2 border-r border-white/15 bg-black/20 px-4 py-2.5">
        <span className="live-dot live-dot-sm" aria-hidden />
        <span className="text-label text-white">{t("breaking")}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="breaking-marquee flex items-center gap-10 py-2.5 pl-4">
          {[...items, ...items].map((item, i) => {
            const content = (
              <span className="text-body-sm font-medium text-white/95 transition hover:text-white hover:underline">
                {item.title}
              </span>
            );
            return item.isExternal && item.link ? (
              <a key={`${item._id}-${i}`} href={item.link} target="_blank" rel="noopener noreferrer" className="shrink-0">
                {content}
              </a>
            ) : (
              <Link key={`${item._id}-${i}`} to={item.slug ? `/article/${item.slug}` : item.link || "/"} className="shrink-0">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
