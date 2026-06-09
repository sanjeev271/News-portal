import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdBanner from "./AdBanner";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t-4 border-bbc-red bg-bbc-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-block bg-bbc-red px-2 py-1 text-lg font-black tracking-tight">NEWS</span>
              <span className="text-lg font-bold">Portal</span>
            </div>
            <p className="text-sm text-slate-400">
              Trusted news, live broadcasts, and in-depth reporting — inspired by world-class journalism.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Sections</h4>
            <nav className="flex flex-col gap-2 text-sm text-slate-300">
              <Link to="/" className="hover:text-white">{t("home")}</Link>
              <Link to="/trending" className="hover:text-white">{t("trending")}</Link>
              <Link to="/live" className="hover:text-white">{t("liveTV")}</Link>
              <Link to="/search" className="hover:text-white">Search</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Account</h4>
            <nav className="flex flex-col gap-2 text-sm text-slate-300">
              <Link to="/login" className="hover:text-white">{t("login")}</Link>
              <Link to="/register" className="hover:text-white">{t("register")}</Link>
              <Link to="/bookmarks" className="hover:text-white">{t("bookmarks")}</Link>
            </nav>
          </div>
          <div>
            <AdBanner placement="footer" />
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} News Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
