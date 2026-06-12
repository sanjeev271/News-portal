import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LiveBroadcastBar({ stream }) {
  const { t } = useTranslation();

  if (!stream || stream.status !== "live") return null;

  return (
    <Link
      to="/live-tv"
      className="group flex items-center gap-2 border-b border-red-900/30 bg-black px-3 py-2.5 text-white transition active:bg-slate-900 sm:px-4"
    >
      <span className="bbc-live-badge shrink-0">{t("live")}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{stream.title}</span>
      <span className="shrink-0 text-xs font-bold text-bbc-red transition group-hover:underline">
        {t("watchNow")} →
      </span>
    </Link>
  );
}
