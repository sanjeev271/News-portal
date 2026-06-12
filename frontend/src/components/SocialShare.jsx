import { useTranslation } from "react-i18next";

export default function SocialShare({ title, url, vertical = false }) {
  const { t } = useTranslation();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encoded = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(title || "");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* ignore */
    }
  };

  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${encoded}` },
  ];

  const btnClass =
    "rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-news-red hover:text-news-red dark:border-slate-600 dark:text-slate-300";

  return (
    <div className={vertical ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2"}>
      <span className="text-label text-slate-500">{t("share")}</span>
      <div className={vertical ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}>
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={btnClass}>
            {l.label}
          </a>
        ))}
        <button type="button" onClick={copyLink} className={btnClass}>
          {t("copyLink")}
        </button>
      </div>
    </div>
  );
}
