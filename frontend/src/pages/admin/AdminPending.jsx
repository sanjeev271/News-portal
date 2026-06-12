import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

export default function AdminPending() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    API.get("/articles/admin/pending")
      .then((r) => setArticles(r.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await API.patch(`/articles/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    const reason = window.prompt("Rejection reason (optional):") || "";
    await API.patch(`/articles/${id}/reject`, { reason });
    load();
  };

  if (loading) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold dark:text-white">Pending Review</h1>
      {articles.length === 0 ? (
        <p className="text-slate-500">No articles awaiting approval.</p>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div>
                <div className="font-bold dark:text-white">{a.title}</div>
                <div className="text-sm text-slate-500">
                  {a.author?.name || "Unknown"} · {a.status}
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/edit/${a._id}`} className="rounded border px-3 py-1 text-sm font-semibold">
                  Review
                </Link>
                <button type="button" onClick={() => approve(a._id)} className="rounded bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
                  Approve
                </button>
                <button type="button" onClick={() => reject(a._id)} className="rounded bg-bbc-red px-3 py-1 text-sm font-bold text-white">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
