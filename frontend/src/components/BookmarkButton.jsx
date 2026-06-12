import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function BookmarkIcon({ filled }) {
  return (
    <svg className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}

export default function BookmarkButton({ articleId, compact = false }) {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    API.get("/bookmarks").then((r) => {
      setSaved(r.data.some((a) => a._id === articleId));
    });
  }, [isLoggedIn, articleId]);

  const toggle = async () => {
    if (!isLoggedIn) return;
    if (saved) {
      await API.delete(`/bookmarks/${articleId}`);
      setSaved(false);
    } else {
      await API.post(`/bookmarks/${articleId}`);
      setSaved(true);
    }
  };

  if (!isLoggedIn) {
    if (compact) return null;
    return <Link to="/login" className="text-sm text-link hover:underline">{t("addBookmark")}</Link>;
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={saved ? t("bookmarked") : t("addBookmark")}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
          saved ? "text-warning" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        }`}
      >
        <BookmarkIcon filled={saved} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`btn-outline gap-1.5 !py-2 !px-3 text-sm ${
        saved ? "!border-amber-300 !text-warning" : ""
      }`}
    >
      <BookmarkIcon filled={saved} />
      {saved ? t("bookmarked") : t("addBookmark")}
    </button>
  );
}
