import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/analytics/dashboard").then((r) => setStats(r.data));
  }, []);

  if (!stats) return <p className="text-slate-400">Loading…</p>;

  const cards = [
    { label: "Total Articles", value: stats.totalArticles },
    { label: "Published", value: stats.publishedArticles },
    { label: "Breaking", value: stats.breakingNews },
    { label: "Total Views", value: stats.totalViews }
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">{t("dashboard")}</h1>
        <Link to="/admin/publish" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          📡 {t("publish")}
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-3xl font-bold dark:text-white">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
