import { useEffect, useState } from "react";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/formatTime";

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({ title: "", placement: "sidebar", link: "", active: true });
  const [image, setImage] = useState(null);

  const load = () => API.get("/ads/admin").then((r) => setAds(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (image) data.append("image", image);
    await API.post("/ads", data);
    setForm({ title: "", placement: "sidebar", link: "", active: true });
    setImage(null);
    load();
  };

  const toggle = async (ad) => {
    await API.put(`/ads/${ad._id}`, { active: !ad.active });
    load();
  };

  const remove = async (id) => {
    await API.delete(`/ads/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Advertisement Management</h1>
      <form onSubmit={save} className="mb-8 space-y-3 rounded-xl border p-5 dark:border-slate-700">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ad title" required
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
        <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white">
          <option value="header">Header</option>
          <option value="sidebar">Sidebar</option>
          <option value="footer">Footer</option>
          <option value="inline">Inline</option>
        </select>
        <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Link URL"
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Create Ad</button>
      </form>
      <div className="space-y-3">
        {ads.map((ad) => (
          <div key={ad._id} className="flex items-center gap-4 rounded-xl border p-4 dark:border-slate-700 dark:bg-slate-900">
            {ad.imageUrl && <img src={getImageUrl(ad.imageUrl)} alt="" className="h-16 w-24 rounded object-cover" />}
            <div className="flex-1">
              <p className="font-semibold dark:text-white">{ad.title}</p>
              <p className="text-sm text-slate-500">{ad.placement} · {ad.active ? "Active" : "Inactive"}</p>
            </div>
            <button onClick={() => toggle(ad)} className="text-sm text-amber-600">{ad.active ? "Deactivate" : "Activate"}</button>
            <button onClick={() => remove(ad._id)} className="text-sm text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
