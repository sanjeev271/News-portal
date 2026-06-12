import { useTranslation } from "react-i18next";
import ArticleCard from "./ArticleCard";
import PageContainer from "./ui/PageContainer";
import SectionHeader from "./ui/SectionHeader";

export default function TopStoriesGrid({ articles = [] }) {
  const { t } = useTranslation();
  if (!articles.length) return null;

  return (
    <section className="section-band section-band-alt">
      <PageContainer>
        <SectionHeader title={t("topStories")} href="/trending" linkLabel={t("viewAll")} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
