import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { currentLocale } from "../utils/localize";

export function usePaginatedArticles({ limit = 12, category, type, page: initialPage = 1 } = {}) {
  const { i18n } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const buildParams = useCallback(
    (pageNum) => {
      const params = { page: pageNum, limit, locale: currentLocale() };
      if (category && category !== "all") params.category = category;
      if (type && type !== "all") params.type = type;
      return params;
    },
    [limit, category, type]
  );

  const loadPage = useCallback(
    async (pageNum) => {
      setLoading(true);
      try {
        const { data } = await API.get("/articles", { params: buildParams(pageNum) });
        setArticles(data.articles || []);
        setPage(data.page || pageNum);
        setPages(data.pages || 1);
        setTotal(data.total ?? data.articles?.length ?? 0);
      } finally {
        setLoading(false);
      }
    },
    [buildParams]
  );

  useEffect(() => {
    loadPage(initialPage);
  }, [loadPage, initialPage, i18n.language]);

  const prependArticle = useCallback((article) => {
    if (page !== 1) return;
    setArticles((prev) => {
      const without = prev.filter((a) => a._id !== article._id);
      return [article, ...without].slice(0, limit);
    });
    setTotal((t) => t + 1);
  }, [page, limit]);

  return {
    articles,
    page,
    pages,
    total,
    loading,
    setPage: loadPage,
    prependArticle,
    reload: () => loadPage(page),
  };
}
