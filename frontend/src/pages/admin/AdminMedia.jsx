import { useEffect, useState } from "react";
import API from "../../api/axios";
import Pagination from "../../components/ui/Pagination";
import { getImageUrl } from "../../utils/formatTime";

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async (p = page) => {
    const { data } = await API.get("/media", { params: { page: p, limit: 24, q: q || undefined, folder: folder || undefined } });
    setItems(data.items || []);
    setPage(data.page || p);
    setPages(data.pages || 1);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    load(1);
  }, [folder]);

  const onUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      if (folder) form.append("folder", folder);
      await API.post("/media", form);
      await load(1);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this media file?")) return;
    await API.delete(`/media/${id}`);
    load(page);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Media Library</h1>
        <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
          {uploading ? "Uploading…" : "+ Upload"}
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={onUpload} />
        </label>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search media…"
          className="input-field max-w-xs"
        />
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Folder"
          className="input-field max-w-[160px]"
        />
        <button type="button" onClick={() => load(1)} className="btn-outline px-4">Search</button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <div key={m._id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            {m.mimeType?.startsWith("image/") ? (
              <img src={getImageUrl(m.url, m.originalName)} alt={m.alt || m.originalName} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-slate-100 text-xs text-slate-500 dark:bg-slate-800">{m.mimeType}</div>
            )}
            <div className="p-2">
              <p className="truncate text-xs font-medium dark:text-white">{m.originalName}</p>
              <p className="text-[10px] text-slate-400">{m.folder} · {(m.size / 1024).toFixed(0)} KB</p>
              <button type="button" onClick={() => remove(m._id)} className="mt-1 text-xs text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} pages={pages} total={total} onPageChange={(p) => load(p)} className="mt-8" />
    </div>
  );
}
