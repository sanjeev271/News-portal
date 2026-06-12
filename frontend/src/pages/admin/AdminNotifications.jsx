import { useEffect, useState } from "react";
import API from "../../api/axios";
import Pagination from "../../components/ui/Pagination";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ title: "", message: "", link: "/" });

  const load = async (p = 1) => {
    const { data } = await API.get("/notifications/admin/all", { params: { page: p, limit: 20 } });
    setNotifications(data.notifications || []);
    setPage(data.page || p);
    setPages(data.pages || 1);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    load(1);
  }, []);

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    await API.post("/notifications/admin/announce", form);
    setForm({ title: "", message: "", link: "/" });
    load(1);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Notifications</h1>

      <form onSubmit={sendAnnouncement} className="mb-8 max-w-lg space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="font-bold dark:text-white">Broadcast Announcement</h2>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="input-field w-full"
          required
        />
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Message"
          className="input-field w-full min-h-[80px]"
        />
        <input
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          placeholder="Link (e.g. /article/slug)"
          className="input-field w-full"
        />
        <button type="submit" className="btn-primary px-6">Send to all users</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.map((n) => (
              <tr key={n._id} className="dark:bg-slate-900">
                <td className="px-4 py-3 dark:text-white">{n.title}</td>
                <td className="px-4 py-3 text-slate-500">{n.type}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(n.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} total={total} onPageChange={(p) => load(p)} className="mt-6" />
    </div>
  );
}
