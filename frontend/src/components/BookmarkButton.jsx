import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function BookmarkButton({ articleId }) {
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
    return <Link to="/login" className="text-sm text-blue-600 hover:underline">{t("addBookmark")}</Link>;
  }

  return (
    <button
      onClick={toggle}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        saved ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:border-amber-300 dark:border-slate-600 dark:text-slate-300"
      }`}
    >
      {saved ? `🔖 ${t("bookmarked")}` : `🔖 ${t("addBookmark")}`}
    </button>
  );
}
