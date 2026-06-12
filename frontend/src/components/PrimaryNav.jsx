import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { localizedCategoryName } from "../utils/localize";

export const PRIMARY_NAV_SLUGS = [
  "world",
  "business",
  "technology",
  "sports",
  "culture",
  "opinion",
];

function drawerLinkClass(active) {
  return `drawer-nav-link${active ? " drawer-nav-link-active" : ""}`;
}

export function MobileNavMenu({ categories = [], onNavigate }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const navCategories = PRIMARY_NAV_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug)
  ).filter(Boolean);

  const isActive = (path, { prefix = false } = {}) =>
    prefix ? location.pathname.startsWith(path) : location.pathname === path;

  const props = (to, active) => ({
    to,
    onClick: onNavigate,
    className: drawerLinkClass(active),
  });

  return (
    <nav className="space-y-0.5" aria-label={t("sections")}>
      <Link {...props("/", isActive("/"))}>{t("home")}</Link>

      {navCategories.map((cat) => (
        <Link
          key={cat._id}
          {...props(`/category/${cat.slug}`, isActive(`/category/${cat.slug}`, { prefix: true }))}
        >
          {localizedCategoryName(cat)}
        </Link>
      ))}

      <div className="my-3 border-t border-white/10" role="presentation" />

      <Link {...props("/trending", isActive("/trending", { prefix: true }))}>{t("trending")}</Link>
      <Link {...props("/live", isActive("/live"))}>
        <span className="flex items-center gap-2">
          {t("live")}
          <span className="h-1.5 w-1.5 rounded-full bg-bbc-red" aria-hidden />
        </span>
      </Link>
      <Link {...props("/live-tv", isActive("/live-tv", { prefix: true }))}>{t("liveTV")}</Link>
      <Link {...props("/search", isActive("/search", { prefix: true }))}>{t("searchNav")}</Link>
      {user && (
        <Link {...props("/bookmarks", isActive("/bookmarks", { prefix: true }))}>{t("bookmarks")}</Link>
      )}
    </nav>
  );
}

export default function PrimaryNav({ categories = [], className = "" }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const navCategories = PRIMARY_NAV_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug)
  ).filter(Boolean);

  const linkClass = (active) =>
    `shrink-0 snap-start border-b-2 px-3 py-3 text-label transition sm:px-4 ${
      active
        ? "border-news-red text-white"
        : "border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200"
    }`;

  return (
    <nav
      className={`border-t border-white/8 bg-news-black ${className}`}
      aria-label="Primary navigation"
    >
      <div className="chip-scroll primary-nav-scroll mx-auto max-w-7xl">
        <Link to="/" className={linkClass(location.pathname === "/")}>
          {t("home")}
        </Link>
        {navCategories.map((cat) => (
          <Link
            key={cat._id}
            to={`/category/${cat.slug}`}
            className={linkClass(location.pathname.startsWith(`/category/${cat.slug}`))}
          >
            {localizedCategoryName(cat)}
          </Link>
        ))}
        <Link to="/trending" className={`${linkClass(location.pathname.startsWith("/trending"))} hidden sm:inline-block`}>
          {t("trending")}
        </Link>
        <Link to="/live" className={linkClass(location.pathname === "/live")}>
          {t("live")}
        </Link>
        <Link to="/live-tv" className={linkClass(location.pathname.startsWith("/live-tv"))}>
          {t("liveTV")}
        </Link>
        {user && (
          <Link to="/bookmarks" className={linkClass(location.pathname.startsWith("/bookmarks"))}>
            {t("bookmarks")}
          </Link>
        )}
      </div>
    </nav>
  );
}
