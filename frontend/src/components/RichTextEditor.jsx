import { useEffect, useRef, useCallback } from "react";

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const lastHtmlRef = useRef(value || "");
  const isTypingRef = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || isTypingRef.current) return;
    const html = value || "";
    if (el.innerHTML !== html) {
      el.innerHTML = html;
      lastHtmlRef.current = html;
    }
  }, [value]);

  const syncChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastHtmlRef.current = html;
    onChange(html);
  }, [onChange]);

  const handleInput = () => {
    isTypingRef.current = true;
    syncChange();
    requestAnimationFrame(() => {
      isTypingRef.current = false;
    });
  };

  const runCommand = (cmd, arg) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(cmd, false, arg ?? null);
    syncChange();
  };

  return (
    <div className="relative z-10 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
        {[
          { cmd: "bold", label: "B" },
          { cmd: "italic", label: "I" },
          { cmd: "underline", label: "U" },
          { cmd: "insertUnorderedList", label: "• List" },
          { cmd: "formatBlock", label: "H2", arg: "h2" },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand(btn.cmd, btn.arg)}
            className="rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        className="rte-editor min-h-[200px] p-4 text-sm outline-none dark:bg-slate-900 dark:text-slate-100"
        onInput={handleInput}
        data-placeholder={placeholder}
      />
    </div>
  );
}
