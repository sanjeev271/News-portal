import { useTranslation } from "react-i18next";
import { formatClockTime, getImageUrl } from "../utils/formatTime";
import { toYoutubeEmbedUrl, isYoutubeUrl } from "../utils/youtubeUrl";
import Badge from "./ui/Badge";

function UpdateMedia({ update, compact = false }) {
  if (update.youtubeUrl && isYoutubeUrl(update.youtubeUrl)) {
    return (
      <div className={`bbc-live-media ${compact ? "bbc-live-media-compact" : ""}`}>
        <iframe
          src={toYoutubeEmbedUrl(update.youtubeUrl)}
          title="Live update video"
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>
    );
  }

  if (update.videoUrl) {
    return (
      <div className={`bbc-live-media ${compact ? "bbc-live-media-compact" : ""}`}>
        <video src={getImageUrl(update.videoUrl)} controls className="h-full w-full" playsInline />
      </div>
    );
  }

  if (update.images?.length) {
    return (
      <div className={`bbc-live-images ${update.images.length > 1 ? "bbc-live-images-grid" : ""}`}>
        {update.images.map((img, i) => (
          <figure key={i} className="bbc-live-figure">
            <img
              src={getImageUrl(img.url)}
              alt={img.caption || ""}
              className="bbc-live-image"
              loading="lazy"
            />
            {img.caption && (
              <figcaption className="bbc-live-caption">{img.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    );
  }

  return null;
}

export default function LiveUpdateEntry({ update, isFresh = false, compact = false }) {
  const { t } = useTranslation();
  const headline = update.title || update.text || update.quote || update.officialStatement;

  return (
    <article className={`bbc-live-entry ${isFresh ? "bbc-live-entry-fresh" : ""} ${update.isBreaking ? "bbc-live-entry-breaking" : ""}`}>
      <div className="bbc-live-entry-meta">
        <time className="bbc-live-time" dateTime={update.createdAt}>
          {formatClockTime(update.createdAt)}
        </time>
        <div className="bbc-live-badges">
          {isFresh && <Badge variant="new">{t("new")}</Badge>}
          {update.isBreaking && <Badge variant="breaking">{t("breaking")}</Badge>}
          {update.isPinned && <Badge variant="pinned">{t("pinned")}</Badge>}
        </div>
      </div>

      <div className="bbc-live-entry-body">
        {update.title && update.text && (
          <h3 className="bbc-live-headline">{update.title}</h3>
        )}

        {update.quote ? (
          <blockquote className="bbc-live-quote">{update.quote}</blockquote>
        ) : update.officialStatement ? (
          <div className="bbc-live-official">
            <p className="bbc-live-official-label">{t("officialStatement")}</p>
            <p className="bbc-live-text whitespace-pre-wrap">{update.officialStatement}</p>
          </div>
        ) : (
          headline && (
            <p className={`bbc-live-text whitespace-pre-wrap ${isFresh ? "font-semibold" : ""}`}>
              {update.title ? update.text : headline}
            </p>
          )
        )}

        <UpdateMedia update={update} compact={compact} />

        <footer className="bbc-live-entry-footer">
          {update.author?.name && <span>{update.author.name}</span>}
          {update.location && <span>📍 {update.location}</span>}
          {update.isEdited && (
            <span>{t("edited")} {formatClockTime(update.editedAt || update.updatedAt)}</span>
          )}
        </footer>
      </div>
    </article>
  );
}
