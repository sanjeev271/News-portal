import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdBanner from "./AdBanner";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer({ compact = false }) {
  const { t } = useTranslation();

  if (compact) {
    return (
      <footer className="border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <div className="mx-auto max-w-7xl space-y-5 px-3 py-6 safe-bottom">
          <AdBanner placement="footer" compact />
          <div className="rounded-xl bg-white p-4 dark:bg-slate-950">
            <h4 className="mb-2 text-sm font-bold text-slate-900 dark:text-white">{t("newsletterTitle")}</h4>
            <NewsletterSignup compact />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-bbc-red">{t("home")}</Link>
            <Link to="/trending" className="hover:text-bbc-red">{t("trending")}</Link>
            <Link to="/live" className="hover:text-bbc-red">{t("live")}</Link>
            <Link to="/live-tv" className="hover:text-bbc-red">{t("liveTV")}</Link>
            <Link to="/login" className="hover:text-bbc-red">{t("login")}</Link>
          </div>
          <p className="text-center text-[10px] text-slate-400">
            © {new Date().getFullYear()} News Portal. {t("copyright")}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto hidden border-t-4 border-bbc-red bg-gradient-to-b from-bbc-black to-black text-white md:block">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-md bg-bbc-red px-2.5 py-1 text-lg font-black">NEWS</span>
              <span className="text-lg font-bold">Portal</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              {t("footerTagline")}
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{t("sections")}</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-300">
              <Link to="/" className="transition hover:text-white hover:underline">{t("home")}</Link>
              <Link to="/trending" className="transition hover:text-white hover:underline">{t("trending")}</Link>
              <Link to="/live" className="transition hover:text-white hover:underline">{t("live")}</Link>
              <Link to="/live-tv" className="transition hover:text-white hover:underline">{t("liveTV")}</Link>
              <Link to="/search" className="transition hover:text-white hover:underline">{t("searchNav")}</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{t("account")}</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-300">
              <Link to="/login" className="transition hover:text-white hover:underline">{t("login")}</Link>
              <Link to="/register" className="transition hover:text-white hover:underline">{t("register")}</Link>
              <Link to="/bookmarks" className="transition hover:text-white hover:underline">{t("bookmarks")}</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{t("newsletterTitle")}</h4>
            <NewsletterSignup compact />
          </div>
          <div>
            <AdBanner placement="footer" />
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} News Portal. {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
