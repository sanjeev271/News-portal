import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function AdminReporters() {
  const [reporters, setReporters] = useState([]);

  useEffect(() => {
    API.get("/users/reporters").then((r) => setReporters(r.data));
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold dark:text-white">Reporters & Journalists</h1>
      <p className="mb-6 text-sm text-slate-500">Manage reporter roles from User Management. Reporters can be assigned stories by admin.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reporters.map((r) => (
          <div key={r._id} className="rounded-xl border p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              {r.name[0]}
            </div>
            <p className="font-semibold dark:text-white">{r.name}</p>
            <p className="text-sm text-slate-500">{r.email}</p>
            <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{r.role}</span>
          </div>
        ))}
        {reporters.length === 0 && <p className="text-slate-400">No reporters yet. Promote users to reporter role in User Management.</p>}
      </div>
    </div>
  );
}
