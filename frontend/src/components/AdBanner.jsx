import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { getImageUrl } from "../utils/formatTime";

export default function AdBanner({ placement, className = "", compact = false }) {
  const { t } = useTranslation();
  const [ads, setAds] = useState([]);

  useEffect(() => {
    API.get(`/ads?placement=${placement}`)
      .then((r) => setAds(r.data))
      .catch(() => setAds([]));
  }, [placement]);

  if (!ads.length) return null;

  const sizeClass =
    placement === "header"
      ? "max-h-24 sm:max-h-32 md:max-h-36"
      : placement === "inline"
        ? "max-h-40 sm:max-h-48"
        : compact
          ? "max-h-32"
          : "max-h-48 sm:max-h-56";

  return (
    <div className={`ad-slot space-y-3 ${className}`} data-placement={placement}>
      {ads.map((ad) => (
        <a
          key={ad._id}
          href={ad.link || "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group block overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition hover:border-bbc-red/60 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between bg-slate-100 px-3 py-1 dark:bg-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t("sponsored")}
            </span>
            <span className="text-[10px] text-slate-400">{t("advertisement")}</span>
          </div>
          {ad.imageUrl ? (
            <img
              src={getImageUrl(ad.imageUrl)}
              alt={ad.title}
              loading="lazy"
              className={`h-auto w-full object-cover transition group-hover:opacity-95 ${sizeClass}`}
            />
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="font-semibold text-slate-800 dark:text-white">{ad.title}</p>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
