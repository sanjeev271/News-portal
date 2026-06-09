import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("/users").then((r) => setUsers(r.data));
  }, []);

  const updateRole = async (id, role) => {
    await API.put(`/users/${id}`, { role });
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
  };

  const updateStatus = async (id, status) => {
    await API.put(`/users/${id}`, { status });
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, status } : u));
  };

  const remove = async (id) => {
    if (!confirm("Delete user?")) return;
    await API.delete(`/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">User Management</h1>
      <div className="overflow-hidden rounded-xl border dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left dark:text-slate-300">Name</th>
              <th className="px-4 py-3 text-left dark:text-slate-300">Email</th>
              <th className="px-4 py-3 text-left dark:text-slate-300">Role</th>
              <th className="px-4 py-3 text-left dark:text-slate-300">Status</th>
              <th className="px-4 py-3 text-right dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700">
            {users.map((u) => (
              <tr key={u._id} className="dark:bg-slate-900">
                <td className="px-4 py-3 dark:text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? (
                    <span className="text-amber-600 font-semibold">👑 admin</span>
                  ) : (
                    <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}
                      className="rounded border px-2 py-1 text-xs dark:bg-slate-800 dark:text-white">
                      <option value="user">user</option>
                      <option value="reporter">reporter</option>
                      <option value="editor">editor</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select value={u.status} onChange={(e) => updateStatus(u._id, e.target.value)}
                    className="rounded border px-2 py-1 text-xs dark:bg-slate-800 dark:text-white">
                    <option value="active">active</option>
                    <option value="banned">banned</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.role !== "admin" && (
                    <button onClick={() => remove(u._id)} className="text-red-600 text-sm hover:underline">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
