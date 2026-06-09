import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loadRememberedEmail } from "../utils/authStorage";
import RoleBadge from "../components/RoleBadge";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const saved = loadRememberedEmail();
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password, rememberMe);
      setLoggedInUser(data);
      const dest = data.role === "admin" ? "/admin" : "/";
      setTimeout(() => navigate(dest), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Login</h2>

      {loggedInUser ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="mb-2 font-semibold text-emerald-800 dark:text-emerald-300">Welcome, {loggedInUser.name}!</p>
          <div className="flex justify-center">
            <RoleBadge role={loggedInUser.role} />
          </div>
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
            {loggedInUser.role === "admin"
              ? "You have admin access — you can publish live news."
              : "You are signed in as a reader — you can like & comment."}
          </p>
        </div>
      ) : (
        <>
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember email on this device
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            No account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
          </p>
          <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            Default logins are stored in <strong>backend/data/users.json</strong>
            <br />
            Admin: <strong>admin@newsportal.com</strong> / <strong>admin123</strong>
            <br />
            Reader: <strong>reader@newsportal.com</strong> / <strong>reader123</strong>
          </p>
        </>
      )}
    </div>
  );
}
