import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import RoleBadge from "./RoleBadge";
import HeaderSearch from "./HeaderSearch";
import PrimaryNav, { MobileNavMenu } from "./PrimaryNav";
import NotificationCenter from "./NotificationCenter";
import LangToggle from "./LangToggle";
import i18n from "../i18n";

function IconSearch({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconSun({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconMoon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function IconLogout({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function userInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function formatEditionDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout, isAdmin, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [lang, setLang] = useState(i18n.language || "en");

  useEffect(() => {
    API.get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onLang = (lng) => setLang(lng);
    i18n.on("languageChanged", onLang);
    return () => i18n.off("languageChanged", onLang);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const changeLang = (lng) => {
    setLang(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bbc-black text-white shadow-lg backdrop-blur-md safe-top">
      {/* Utility bar — desktop only */}
      <div className="hidden border-b border-white/5 bg-black/40 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-[11px] text-slate-400">
          <span className="font-medium tracking-wide">{formatEditionDate()}</span>
          <div className="flex items-center gap-4">
            <Link to="/live" className="flex items-center gap-1.5 font-semibold text-slate-300 transition hover:text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-bbc-red" />
              {t("live")}
            </Link>
            <Link to="/live-tv" className="transition hover:text-white">{t("liveTV")}</Link>
            <Link to="/trending" className="transition hover:text-white">{t("trending")}</Link>
            {user && (
              <Link to="/bookmarks" className="transition hover:text-white">{t("bookmarks")}</Link>
            )}
            <LangToggle lang={lang} onChange={changeLang} />
          </div>
        </div>
      </div>

      {/* Mobile top bar — hamburger, logo, language toggle, search */}
      <div className="relative mx-auto grid h-14 max-w-7xl grid-cols-[3rem_1fr_auto] items-center px-2 md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`touch-target flex h-10 w-10 items-center justify-center rounded-lg text-white transition ${
            menuOpen ? "bg-white/10 ring-1 ring-white/20" : "active:bg-white/10"
          }`}
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

        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center justify-center gap-1.5 transition active:opacity-80"
        >
          <span className="shrink-0 rounded bg-bbc-red px-2 py-0.5 text-sm font-black tracking-tight">NEWS</span>
          <span className="text-sm font-bold tracking-tight">Portal</span>
        </Link>

        <div className="flex items-center justify-end gap-0.5">
          <LangToggle lang={lang} onChange={changeLang} compact className="shrink-0" />
          <Link
            to="/search"
            className="touch-target flex h-10 w-10 items-center justify-center rounded-lg transition active:bg-white/10"
            aria-label={t("searchNav")}
          >
            <IconSearch />
          </Link>
        </div>
      </div>

      {/* Desktop main bar */}
      <div className="mx-auto hidden max-w-7xl items-center gap-6 px-6 py-3.5 md:flex">
        <Link to="/" className="flex shrink-0 items-center gap-2 transition hover:opacity-90">
          <span className="rounded bg-bbc-red px-2.5 py-1 text-xl font-black tracking-tight shadow-md">NEWS</span>
          <span className="text-xl font-bold tracking-tight">Portal</span>
        </Link>

        <HeaderSearch className="mx-auto max-w-lg flex-1" />

        <div className="flex shrink-0 items-center gap-1.5">
          <NotificationCenter />

          <button
            onClick={toggleTheme}
            className="touch-target rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>

          {loading ? (
            <span className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bbc-red text-xs font-black">
                  {userInitials(user.name)}
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="max-w-[120px] truncate text-sm font-semibold">{user.name}</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>
              {isAdmin && (
                <Link to="/admin" className="btn-primary px-3 py-1.5 text-xs">{t("adminPanel")}</Link>
              )}
              <button
                onClick={logout}
                className="touch-target rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-400 hover:text-white"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white">
                {t("login")}
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                {t("register")}
              </Link>
            </div>
          )}
        </div>
      </div>

      <PrimaryNav categories={categories} className="hidden md:block" />
    </header>

      {/* Mobile drawer — rendered outside header so backdrop-blur does not clip fixed panel */}
      {menuOpen && (
        <>
          <div
            className="drawer-overlay fixed inset-0 top-14 z-[60] bg-black/70 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
            aria-hidden
          />
          <nav
            className="mobile-drawer-panel mobile-drawer fixed bottom-0 left-0 top-14 z-[70] flex w-full max-w-sm flex-col bg-bbc-black text-white shadow-2xl md:hidden"
            aria-label="Mobile menu"
          >
            <div className="border-b border-white/10 px-4 py-4 text-white">
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-white/10" />
                  <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bbc-red text-sm font-black">
                    {userInitials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{user.name}</p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                    <div className="mt-1"><RoleBadge role={user.role} /></div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-bold">{t("welcome")}</p>
                  <p className="mt-0.5 text-sm text-slate-400">{t("signInPrompt")}</p>
                  <div className="mt-3 flex gap-2">
                    <Link to="/login" onClick={closeMenu} className="flex-1 rounded-lg border border-white/20 py-2.5 text-center text-sm font-semibold text-white active:bg-white/10">
                      {t("login")}
                    </Link>
                    <Link to="/register" onClick={closeMenu} className="btn-primary flex-1 py-2.5 text-center text-sm">
                      {t("register")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-24 text-white">
              <div className="mb-5">
                <HeaderSearch />
              </div>

              <p className="drawer-section-label mb-2">{t("sections")}</p>
              <MobileNavMenu categories={categories} onNavigate={closeMenu} />

              <div className="mt-6 space-y-3">
                <p className="drawer-section-label">{t("settings")}</p>
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
                  <span className="text-sm font-medium text-slate-300">{t("language")}</span>
                  <LangToggle lang={lang} onChange={changeLang} compact />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
                  <span className="text-sm font-medium text-slate-300">
                    {theme === "dark" ? t("lightMode") : t("darkMode")}
                  </span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 active:bg-white/15"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {user && (
                <div className="mt-6 space-y-1">
                  <p className="drawer-section-label mb-2">{t("account")}</p>
                  {isAdmin && (
                    <>
                      <Link to="/admin" onClick={closeMenu} className="drawer-action-link">{t("adminPanel")}</Link>
                      <Link to="/admin/publish" onClick={closeMenu} className="drawer-action-link">{t("publish")}</Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => { logout(); closeMenu(); }}
                    className="drawer-action-link w-full text-left text-red-300"
                  >
                    <IconLogout className="text-red-400" />
                    {t("logout")}
                  </button>
                </div>
              )}

              <p className="mt-8 border-t border-white/10 pt-4 text-[11px] text-slate-500">
                {formatEditionDate()}
              </p>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
