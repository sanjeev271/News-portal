import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const tabs = [
  {
    to: "/",
    label: "home",
    icon: () => (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    end: true,
  },
  {
    to: "/trending",
    label: "trending",
    icon: (active) => (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    to: "/live",
    label: "liveTV",
    icon: () => (
      <span className="relative flex h-6 w-6 items-center justify-center">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </span>
    ),
    highlight: true,
  },
  {
    to: "/search",
    label: "searchNav",
    icon: () => (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    to: "/bookmarks",
    label: "bookmarks",
    icon: () => (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (tab) => {
    if (tab.end) return location.pathname === tab.to;
    return location.pathname.startsWith(tab.to);
  };

  return (
    <nav
      className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/95 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`touch-target flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition ${
                active
                  ? "text-bbc-red"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className={active && tab.highlight ? "text-bbc-red" : ""}>
                {tab.icon()}
              </span>
              <span className="truncate">{t(tab.label)}</span>
              {active && <span className="h-0.5 w-5 rounded-full bg-bbc-red" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
