import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";

export default function HeaderSearch({ className = "" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const { data } = await API.get("/search/autocomplete", { params: { q: q.trim(), limit: 8 } });
      setSuggestions(data.suggestions || []);
      setOpen(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 280);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (value) => {
    const q = (value ?? query).trim();
    setOpen(false);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const onKeyDown = (e) => {
    if (!open || !suggestions.length) {
      if (e.key === "Enter") submit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = suggestions[activeIndex];
      setOpen(false);
      navigate(item.url);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => suggestions.length && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t("search")}
          className="w-full rounded-full border border-white/15 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-bbc-red focus:bg-white/15 focus:ring-1 focus:ring-bbc-red/40"
          aria-label={t("searchNav")}
          aria-expanded={open}
          aria-controls="search-suggestions"
          autoComplete="off"
          role="combobox"
        />
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          {suggestions.map((item, i) => (
            <li key={`${item.type}-${item.id}`} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={() => {
                  setOpen(false);
                  navigate(item.url);
                }}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  i === activeIndex ? "bg-slate-50 dark:bg-slate-800" : ""
                }`}
              >
                <TypeBadge type={item.type} />
                <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TypeBadge({ type }) {
  const labels = {
    article: "Article",
    liveEvent: "Live",
    category: "Cat",
  };
  return (
    <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800">
      {labels[type] || type}
    </span>
  );
}
