import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function pageRange(current, total, delta = 2) {
  const range = [];
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  for (let i = left; i <= right; i += 1) {
    range.push(i);
  }
  return range;
}

export default function Pagination({
  page = 1,
  pages = 1,
  total,
  onPageChange,
  paramName = "page",
  className = "",
}) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  if (pages <= 1) return null;

  const go = (next) => {
    const p = Math.min(Math.max(next, 1), pages);
    if (onPageChange) {
      onPageChange(p);
      return;
    }
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (p <= 1) params.delete(paramName);
      else params.set(paramName, String(p));
      return params;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nums = pageRange(page, pages);

  return (
    <nav
      className={`flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`}
      aria-label={t("pagination")}
    >
      {total != null && (
        <p className="text-meta text-slate-500">
          {t("pageOf", { page, pages, total })}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="btn-outline min-h-[40px] px-3 text-sm disabled:opacity-40"
          aria-label={t("previousPage")}
        >
          ←
        </button>
        {nums[0] > 1 && (
          <>
            <PageBtn n={1} current={page} onClick={go} />
            {nums[0] > 2 && <span className="px-2 text-slate-400">…</span>}
          </>
        )}
        {nums.map((n) => (
          <PageBtn key={n} n={n} current={page} onClick={go} />
        ))}
        {nums[nums.length - 1] < pages && (
          <>
            {nums[nums.length - 1] < pages - 1 && <span className="px-2 text-slate-400">…</span>}
            <PageBtn n={pages} current={page} onClick={go} />
          </>
        )}
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= pages}
          className="btn-outline min-h-[40px] px-3 text-sm disabled:opacity-40"
          aria-label={t("nextPage")}
        >
          →
        </button>
      </div>
    </nav>
  );
}

function PageBtn({ n, current, onClick }) {
  const active = n === current;
  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      className={`min-h-[40px] min-w-[40px] rounded-lg border px-3 text-sm font-semibold transition ${
        active
          ? "border-bbc-red bg-bbc-red text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-bbc-red dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {n}
    </button>
  );
}
