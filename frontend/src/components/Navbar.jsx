import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import RoleBadge from "./RoleBadge";
import i18n from "../i18n";

const navLinks = [
  { to: "/", label: "home" },
  { to: "/trending", label: "trending" },
  { to: "/live", label: "liveTV" },
  { to: "/search", label: "searchNav" },
  { to: "/bookmarks", label: "bookmarks" },
];

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
    <header className="sticky top-0 z-50 bg-bbc-black text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded p-1.5 hover:bg-white/10 md:hidden"
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-0">
            <span className="bg-bbc-red px-2 py-1 text-lg font-black tracking-tight sm:text-xl">NEWS</span>
            <span className="hidden pl-2 text-lg font-bold sm:inline sm:text-xl">Portal</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.slice(0, 1).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {t(l.label)}
            </Link>
          ))}

          <div className="relative" ref={catRef}>
            <button
              type="button"
              onClick={() => setCatOpen((o) => !o)}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition hover:bg-white/10 hover:text-white ${
                isCategoryActive || catOpen ? "text-white" : "text-slate-300"
              }`}
              aria-expanded={catOpen}
              aria-haspopup="true"
            >
              {t("categories")}
              <svg
                className={`h-4 w-4 transition-transform ${catOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {catOpen && categories.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] border border-slate-700 bg-bbc-black py-1 shadow-xl">
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    to={`/category/${c.slug}`}
                    onClick={() => setCatOpen(false)}
                    className={`block px-4 py-2.5 text-sm transition hover:bg-white/10 hover:text-white ${
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
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {t(l.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="rounded p-1.5 text-sm hover:bg-white/10"
            title={theme === "dark" ? t("lightMode") : t("darkMode")}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <select
            onChange={(e) => changeLang(e.target.value)}
            defaultValue={i18n.language}
            className="rounded bg-white/10 px-2 py-1 text-xs text-slate-200"
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
          </select>

          {loading ? (
            <span className="text-xs text-slate-400">…</span>
          ) : user ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-xs text-slate-400">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
              {isAdmin && (
                <Link to="/admin" className="bg-bbc-red px-2 py-1 text-xs font-bold sm:px-3 sm:text-sm">
                  {t("adminPanel")}
                </Link>
              )}
              <button onClick={logout} className="border border-slate-600 px-2 py-1 text-xs sm:text-sm">
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs text-slate-300 sm:text-sm">{t("login")}</Link>
              <Link to="/register" className="bg-bbc-red px-2 py-1 text-xs font-bold sm:px-3 sm:text-sm">
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-800 bg-bbc-black px-4 py-3 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-slate-800 py-3 text-sm font-medium text-slate-300 hover:text-white"
            >
              {t(l.label)}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setMobileCatOpen((o) => !o)}
            className="flex w-full items-center justify-between border-b border-slate-800 py-3 text-sm font-medium text-slate-300 hover:text-white"
          >
            {t("categories")}
            <svg
              className={`h-4 w-4 transition-transform ${mobileCatOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mobileCatOpen && (
            <div className="border-b border-slate-800 pb-2 pl-3">
              {categories.map((c) => (
                <Link
                  key={c._id}
                  to={`/category/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-sm text-slate-400 hover:text-white"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
