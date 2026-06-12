import { useTranslation } from "react-i18next";
import LiveUpdateEntry from "./LiveUpdateEntry";
import Badge from "./ui/Badge";

import { dedupeById } from "../utils/localize";

export default function LiveTimeline({ updates = [], freshIds = new Set(), isLive = false }) {
  const { t } = useTranslation();
  const items = dedupeById(updates);

  if (!items.length) {
    return (
      <div className="empty-state">
        <p className="text-body-sm text-slate-600 dark:text-slate-400">{t("noLiveUpdatesYet")}</p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <section aria-label={t("liveUpdates")} className="bbc-live-timeline">
      <header className="mb-6 flex items-center gap-3">
        {isLive && <Badge variant="live">{t("live")}</Badge>}
        <h2 className="bbc-section-heading">{t("keyUpdates")}</h2>
      </header>

      <div className="bbc-live-feed-list bbc-live-feed-list-full">
        {sorted.map((update) => (
          <LiveUpdateEntry
            key={update._id}
            update={update}
            isFresh={freshIds.has(update._id)}
          />
        ))}
      </div>
    </section>
  );
}
