import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    API.get("/articles/admin/all").then((r) => setArticles(r.data));
  }, []);

  const togglePublish = async (article) => {
    const status = article.status === "published" ? "draft" : "published";
    await API.put(`/articles/${article._id}`, { status });
    setArticles((prev) => prev.map((a) => a._id === article._id ? { ...a, status } : a));
  };

  const deleteArticle = async (id) => {
    if (!confirm("Delete this article?")) return;
    await API.delete(`/articles/${id}`);
    setArticles((prev) => prev.filter((a) => a._id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Manage Articles</h1>
        <Link to="/admin/publish" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">+ New Article</Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left dark:text-slate-300">Title</th>
              <th className="px-4 py-3 text-left dark:text-slate-300">Status</th>
              <th className="px-4 py-3 text-left dark:text-slate-300">Type</th>
              <th className="px-4 py-3 text-left dark:text-slate-300">Views</th>
              <th className="px-4 py-3 text-right dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {articles.map((a) => (
              <tr key={a._id} className="dark:bg-slate-900">
                <td className="px-4 py-3 font-medium dark:text-white">{a.title}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    a.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{a.mediaType}</td>
                <td className="px-4 py-3 text-slate-500">{a.views}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link to={`/admin/edit/${a._id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <button onClick={() => togglePublish(a)} className="text-amber-600 hover:underline">
                    {a.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => deleteArticle(a._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
