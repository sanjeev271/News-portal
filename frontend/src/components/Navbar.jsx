import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import RoleBadge from "./RoleBadge";
import i18n from "../i18n";

const navLinks = [
  { to: "/", label: "home", end: true },
  { to: "/trending", label: "trending" },
  { to: "/live", label: "liveTV" },
  { to: "/search", label: "searchNav" },
  { to: "/bookmarks", label: "bookmarks" },
];

function NavLink({ to, children, onClick, mobile = false }) {
  const location = useLocation();
  const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  if (mobile) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`mobile-nav-link ${
          active ? "bg-white/15 text-white" : "text-slate-300"
        }`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout, isAdmin, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const catRef = useRef(null);

  useEffect(() => {
    API.get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCatOpen(false);
    setMobileCatOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const isCategoryActive = location.pathname.startsWith("/category/");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bbc-black/95 text-white shadow-lg backdrop-blur-md safe-top">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="touch-target rounded-lg p-2 transition hover:bg-white/10 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-1.5 transition hover:opacity-90 sm:gap-2">
            <span className="shrink-0 rounded-md bg-bbc-red px-2 py-1 text-sm font-black tracking-tight shadow-md sm:px-2.5 sm:text-lg">
              NEWS
            </span>
            <span className="truncate text-sm font-bold sm:inline sm:text-lg">Portal</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-0.5 md:flex">
          <NavLink to="/">{t("home")}</NavLink>

          <div className="relative" ref={catRef}>
            <button
              type="button"
              onClick={() => setCatOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10 ${
                isCategoryActive || catOpen ? "bg-white/15 text-white" : "text-slate-300"
              }`}
              aria-expanded={catOpen}
            >
              {t("categories")}
              <svg className={`h-4 w-4 transition ${catOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {catOpen && categories.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-slate-700/80 bg-bbc-black py-1.5 shadow-2xl">
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    to={`/category/${c.slug}`}
                    onClick={() => setCatOpen(false)}
                    className={`block px-4 py-2.5 text-sm transition hover:bg-white/10 ${
                      location.pathname === `/category/${c.slug}` ? "bg-white/10 font-bold text-white" : "text-slate-300"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((l) => (
            <NavLink key={l.to} to={l.to}>{t(l.label)}</NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            onClick={toggleTheme}
            className="touch-target rounded-lg p-2 text-base transition hover:bg-white/10"
            title={theme === "dark" ? t("lightMode") : t("darkMode")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <select
            onChange={(e) => changeLang(e.target.value)}
            defaultValue={i18n.language}
            className="rounded-lg border-0 bg-white/10 px-2 py-1.5 text-xs text-slate-200 outline-none ring-1 ring-white/10"
            aria-label="Language"
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
          </select>

          {loading ? (
            <span className="h-9 w-9 animate-pulse rounded-lg bg-white/10" />
          ) : user ? (
            <>
              <div className="hidden items-center gap-2 lg:flex">
                <span className="max-w-[100px] truncate text-xs text-slate-400">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
              {isAdmin && (
                <Link to="/admin" className="btn-primary hidden px-3 py-1.5 text-xs sm:inline-flex">
                  {t("adminPanel")}
                </Link>
              )}
              <button
                onClick={logout}
                className="touch-target rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs transition hover:bg-white/10 sm:text-sm"
              >
                <span className="hidden sm:inline">{t("logout")}</span>
                <span className="sm:hidden" aria-label={t("logout")}>⎋</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm text-slate-300 transition hover:text-white sm:inline">
                {t("login")}
              </Link>
              <Link to="/register" className="btn-primary px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm">
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-[53px] z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <nav className="mobile-drawer fixed inset-x-0 top-[53px] z-50 border-t border-slate-800 bg-bbc-black px-3 py-4 shadow-2xl md:hidden">
            <div className="space-y-1">
              {navLinks.map((l) => (
                <NavLink key={l.to} to={l.to} mobile onClick={() => setMenuOpen(false)}>
                  {t(l.label)}
                </NavLink>
              ))}

              <button
                type="button"
                onClick={() => setMobileCatOpen((o) => !o)}
                className="mobile-nav-link flex w-full items-center justify-between text-slate-300"
              >
                {t("categories")}
                <svg className={`h-5 w-5 transition ${mobileCatOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {mobileCatOpen && (
                <div className="ml-2 space-y-0.5 border-l-2 border-slate-700 pl-3">
                  {categories.map((c) => (
                    <Link
                      key={c._id}
                      to={`/category/${c.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="mobile-nav-link text-sm text-slate-400"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
              <select
                onChange={(e) => changeLang(e.target.value)}
                defaultValue={i18n.language}
                className="flex-1 rounded-lg bg-white/10 px-3 py-3 text-sm text-slate-200"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 py-3 text-center">
                      {t("adminPanel")}
                    </Link>
                  )}
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-lg border border-slate-600 py-3 text-center text-sm font-semibold">
                  {t("login")}
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
