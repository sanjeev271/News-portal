import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import Pagination from "../../components/ui/Pagination";

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const load = async (p = 1) => {
    const { data } = await API.get("/comments/admin/all", {
      params: { page: p, limit: 20, status: status || undefined, q: q || undefined },
    });
    setComments(data.comments || []);
    setPage(data.page || p);
    setPages(data.pages || 1);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    load(page);
  }, [status]);

  const moderate = async (id, moderationStatus) => {
    await API.patch(`/comments/${id}/moderate`, { moderationStatus });
    load(page);
  };

  const remove = async (id) => {
    if (!confirm("Delete comment?")) return;
    await API.delete(`/comments/${id}`);
    load(page);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Comment Moderation</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search comments…" className="input-field max-w-xs" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field max-w-[180px]">
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="reported">Reported</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="button" onClick={() => load(1)} className="btn-outline px-4">Filter</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left">Comment</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Article</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {comments.map((c) => (
              <tr key={c._id} className="dark:bg-slate-900">
                <td className="max-w-xs truncate px-4 py-3 dark:text-white">{c.text}</td>
                <td className="px-4 py-3 text-slate-500">{c.user?.name || "—"}</td>
                <td className="px-4 py-3">
                  {c.article?.slug ? (
                    <Link to={`/article/${c.article.slug}`} className="text-blue-600 hover:underline">{c.article.title}</Link>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{c.moderationStatus || "approved"}</span>
                </td>
                <td className="space-x-2 px-4 py-3 text-right">
                  <button type="button" onClick={() => moderate(c._id, "approved")} className="text-emerald-600 hover:underline">Approve</button>
                  <button type="button" onClick={() => moderate(c._id, "rejected")} className="text-amber-600 hover:underline">Reject</button>
                  <button type="button" onClick={() => remove(c._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} total={total} onPageChange={(p) => load(p)} className="mt-6" />
    </div>
  );
}
