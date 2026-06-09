import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminSEO() {
  const [form, setForm] = useState({ siteTitle: "", siteDescription: "", siteKeywords: "", ogImage: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    API.get("/settings/seo").then((r) => setForm(r.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    await API.put("/settings/seo", form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">SEO Management</h1>
      <form onSubmit={save} className="max-w-xl space-y-4">
        {["siteTitle", "siteDescription", "siteKeywords", "ogImage"].map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-semibold capitalize dark:text-slate-300">{field.replace(/([A-Z])/g, " $1")}</label>
            <input value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
        ))}
        <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white">Save SEO Settings</button>
        {saved && <span className="ml-3 text-sm text-emerald-600">Saved!</span>}
      </form>
    </div>
  );
}
