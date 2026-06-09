import { getImageUrl } from "../utils/formatTime";

export default function ArticlePublishPreview({ title, summary, categoryName, imageUrl, isBreaking }) {
  if (!title) return null;

  return (
    <div className="overflow-hidden border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <p className="border-b border-slate-100 bg-bbc-grey px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:border-slate-700 dark:bg-slate-800">
        Preview — how it appears on homepage
      </p>
      <div
        className={`h-40 bg-cover bg-center sm:h-48 ${!imageUrl ? "bg-bbc-dark-grey" : ""}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
      />
      <div className="p-4">
        <div className="mb-2 flex gap-2">
          {isBreaking && (
            <span className="bg-bbc-red px-2 py-0.5 text-[10px] font-black uppercase text-white">Breaking</span>
          )}
          {categoryName && (
            <span className="text-[11px] font-bold uppercase tracking-widest text-bbc-red">{categoryName}</span>
          )}
        </div>
        <h3 className="text-lg font-extrabold leading-snug text-slate-900 dark:text-white">{title}</h3>
        {summary && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{summary}</p>}
      </div>
    </div>
  );
}
