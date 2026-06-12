import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminBreakingNews() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    link: "",
    priority: 0,
    isPinned: false,
    isActive: true,
  });

  const load = () => API.get("/breaking").then((r) => setItems(r.data));

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await API.post("/breaking", form);
    setForm({ title: "", message: "", link: "", priority: 0, isPinned: false, isActive: true });
    load();
  };

  const toggle = async (id, active) => {
    await API.patch(`/breaking/${id}/${active ? "activate" : "deactivate"}`);
    load();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold dark:text-white">Breaking News</h1>

      <form onSubmit={create} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <input
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder="Headline"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder="Link (optional)"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
        />
        <button type="submit" className="btn-primary w-fit px-4 py-2">Create Breaking Alert</button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <div className="font-bold dark:text-white">{item.title}</div>
              <div className="text-sm text-slate-500">{item.isActive ? "Active" : "Inactive"} · Priority {item.priority}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(item._id, !item.isActive)}
              className={`rounded px-3 py-1 text-sm font-bold text-white ${item.isActive ? "bg-slate-600" : "bg-bbc-red"}`}
            >
              {item.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
