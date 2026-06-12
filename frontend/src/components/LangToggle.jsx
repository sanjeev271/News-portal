const LANGS = [
  { code: "en", label: "EN" },
  { code: "ne", label: "NE" },
];

export default function LangToggle({ lang, onChange, compact = false, className = "", dark = true }) {
  const inactiveClass = dark
    ? "text-slate-400 hover:text-white"
    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white";
  const wrapClass = dark
    ? "bg-white/10 ring-white/10"
    : "bg-slate-100 ring-slate-200 dark:bg-white/10 dark:ring-white/10";

  return (
    <div
      className={`inline-flex rounded-md p-0.5 ring-1 ${wrapClass} ${compact ? "text-[10px]" : "text-xs"} ${className}`}
      role="group"
      aria-label="Language"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`rounded px-2 py-1 font-bold transition ${
            lang === code ? "bg-bbc-red text-white shadow-sm" : inactiveClass
          } ${compact ? "min-w-[2rem]" : "min-w-[2.25rem]"}`}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
