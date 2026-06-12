import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProtectedRoute from "../ProtectedRoute";

const links = [
  { to: "/admin", label: "dashboard", end: true },
  { to: "/admin/articles", label: "articles" },
  { to: "/admin/publish", label: "publish" },
  { to: "/admin/categories", label: "categories" },
  { to: "/admin/users", label: "users" },
  { to: "/admin/reporters", label: "reporters" },
  { to: "/admin/ads", label: "ads" },
  { to: "/admin/seo", label: "seo" },
  { to: "/admin/live", label: "liveBroadcast" },
  { to: "/admin/live-events", label: "liveEvents" },
  { to: "/admin/breaking", label: "breakingNews" },
  { to: "/admin/pending", label: "pendingReview" },
  { to: "/admin/media", label: "mediaLibrary" },
  { to: "/admin/comments", label: "commentModeration" },
  { to: "/admin/notifications", label: "notifications" },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-[calc(100vh-56px)]">
        <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">{t("adminPanel")}</h2>
          <nav className="space-y-1">
            {links.map((l) => {
              const active = l.end ? location.pathname === l.to : location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`block px-3 py-2 text-sm font-medium ${
                    active
                      ? "border-l-4 border-bbc-red bg-bbc-grey font-bold dark:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {t(l.label)}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-6 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
