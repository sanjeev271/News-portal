import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageContainer from "../components/ui/PageContainer";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <PageContainer className="flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-label text-slate-400">404</p>
      <h1 className="text-display mt-2 text-slate-900 dark:text-white">{t("pageNotFound")}</h1>
      <p className="text-body-sm mt-3 max-w-md text-slate-500 dark:text-slate-400">{t("pageNotFoundDesc")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary px-6 py-3">{t("backToHome")}</Link>
        <Link to="/search" className="btn-outline px-6 py-3">{t("searchNav")}</Link>
      </div>
    </PageContainer>
  );
}
