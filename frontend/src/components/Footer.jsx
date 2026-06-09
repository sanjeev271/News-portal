import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdBanner from "./AdBanner";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t-4 border-bbc-red bg-gradient-to-b from-bbc-black to-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-md bg-bbc-red px-2.5 py-1 text-lg font-black">NEWS</span>
              <span className="text-lg font-bold">Portal</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Trusted news, live broadcasts, and in-depth reporting — delivered in real time.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Sections</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-300">
              <Link to="/" className="transition hover:text-white hover:underline">{t("home")}</Link>
              <Link to="/trending" className="transition hover:text-white hover:underline">{t("trending")}</Link>
              <Link to="/live" className="transition hover:text-white hover:underline">{t("liveTV")}</Link>
              <Link to="/search" className="transition hover:text-white hover:underline">Search</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Account</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-300">
              <Link to="/login" className="transition hover:text-white hover:underline">{t("login")}</Link>
              <Link to="/register" className="transition hover:text-white hover:underline">{t("register")}</Link>
              <Link to="/bookmarks" className="transition hover:text-white hover:underline">{t("bookmarks")}</Link>
            </nav>
          </div>
          <div>
            <AdBanner placement="footer" />
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} News Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
