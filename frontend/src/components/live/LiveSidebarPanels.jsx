import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatTime, getImageUrl } from "../../utils/formatTime";

export default function LiveEventInfoPanel({ event, stream }) {
  const { t } = useTranslation();
  if (!event) return null;

  return (
    <section className="sidebar-card">
      <h3 className="bbc-section-title mb-3 text-base dark:text-white">{t("eventInfo")}</h3>
      {event.coverImage && (
        <img
          src={getImageUrl(event.coverImage, event.title)}
          alt=""
          className="mb-3 aspect-video w-full rounded-lg object-cover"
        />
      )}
      <dl className="space-y-2 text-sm">
        {event.category?.name && (
          <div>
            <dt className="text-meta">{t("categories")}</dt>
            <dd className="font-medium dark:text-white">{event.category.name}</dd>
          </div>
        )}
        {event.location && (
          <div>
            <dt className="text-meta">{t("location")}</dt>
            <dd className="font-medium dark:text-white">📍 {event.location}</dd>
          </div>
        )}
        {event.startedAt && (
          <div>
            <dt className="text-meta">{t("started")}</dt>
            <dd>{formatTime(event.startedAt)}</dd>
          </div>
        )}
        {event.status === "ended" && event.endedAt && (
          <div>
            <dt className="text-meta">{t("ended")}</dt>
            <dd>{formatTime(event.endedAt)}</dd>
          </div>
        )}
        {stream?.peakViewers > 0 && (
          <div>
            <dt className="text-meta">{t("peakViewers")}</dt>
            <dd>{stream.peakViewers.toLocaleString()}</dd>
          </div>
        )}
      </dl>
      {event.description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{event.description}</p>
      )}
    </section>
  );
}

export function ReporterCard({ reporter, event }) {
  const { t } = useTranslation();
  const person = reporter || event?.createdBy;
  if (!person?.name) return null;

  return (
    <section className="sidebar-card">
      <h3 className="bbc-section-title mb-3 text-base dark:text-white">{t("reporter")}</h3>
      <div className="flex items-center gap-3">
        {person.avatar ? (
          <img src={getImageUrl(person.avatar)} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bbc-red text-lg font-bold text-white">
            {person.name.charAt(0)}
          </div>
        )}
        <div>
          <Link to={`/author/${person._id}`} className="font-bold text-slate-900 hover:text-bbc-red dark:text-white">
            {person.name}
          </Link>
          <p className="text-meta capitalize">{person.role || "reporter"}</p>
        </div>
      </div>
    </section>
  );
}

export function RelatedArticlesSidebar({ articles = [] }) {
  const { t } = useTranslation();
  if (!articles.length) return null;

  return (
    <section className="sidebar-card">
      <h3 className="bbc-section-title mb-3 text-base dark:text-white">{t("relatedArticles")}</h3>
      <ul className="space-y-3">
        {articles.slice(0, 5).map((a) => (
          <li key={a._id}>
            <Link to={`/article/${a.slug}`} className="group block">
              <p className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-bbc-red dark:text-white">
                {a.title}
              </p>
              <time className="text-meta mt-1 block">{formatTime(a.publishedAt || a.createdAt)}</time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
