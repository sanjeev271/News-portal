export default function LanguageField({ value, onChange, name = "locale", className = "", label = "Language" }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 block font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      >
        <option value="ne">नेपाली (Nepali)</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}

export function LanguageBadge({ locale }) {
  const label = locale === "en" ? "EN" : "NE";
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        locale === "en"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
          : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
      }`}
    >
      {label}
    </span>
  );
}
