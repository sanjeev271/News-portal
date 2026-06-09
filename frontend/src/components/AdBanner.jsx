import { useEffect, useState } from "react";
import API from "../api/axios";
import { getImageUrl } from "../utils/formatTime";

export default function AdBanner({ placement, className = "" }) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    API.get(`/ads?placement=${placement}`)
      .then((r) => setAds(r.data))
      .catch(() => setAds([]));
  }, [placement]);

  if (!ads.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {ads.map((ad) => (
        <a
          key={ad._id}
          href={ad.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden border border-slate-200 bg-white transition hover:border-bbc-red dark:border-slate-700 dark:bg-slate-900"
        >
          {ad.imageUrl ? (
            <img
              src={getImageUrl(ad.imageUrl)}
              alt={ad.title}
              className="h-auto w-full object-cover transition group-hover:opacity-95"
            />
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Advertisement</p>
              <p className="mt-1 font-semibold text-slate-800 dark:text-white">{ad.title}</p>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
