import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);

  const load = () => API.get("/categories").then((r) => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (editId) {
      await API.put(`/categories/${editId}`, form);
    } else {
      await API.post("/categories", form);
    }
    setForm({ name: "", description: "" });
    setEditId(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete category?")) return;
    await API.delete(`/categories/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Manage Categories</h1>
      <form onSubmit={save} className="mb-8 flex flex-wrap gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required
          className="rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description"
          className="rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">{editId ? "Update" : "Add"}</button>
      </form>
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c._id} className="flex items-center justify-between rounded-lg border p-4 dark:border-slate-700 dark:bg-slate-900">
            <div>
              <p className="font-semibold dark:text-white">{c.name}</p>
              <p className="text-sm text-slate-500">{c.description}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => { setEditId(c._id); setForm({ name: c.name, description: c.description }); }} className="text-blue-600 text-sm">Edit</button>
              <button onClick={() => remove(c._id)} className="text-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
