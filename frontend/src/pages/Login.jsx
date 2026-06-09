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
    <div className="flex min-h-[60vh] items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
      <div className="card-surface w-full max-w-md p-6 sm:p-10">
      <h2 className="mb-2 text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back</h2>
      <p className="mb-6 text-sm text-slate-500">Sign in to bookmark stories and join the conversation.</p>

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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-bbc-red focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-red-900/30"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-bbc-red focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-red-900/30"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember email on this device
            </label>
            <button type="submit" className="btn-primary w-full py-3">
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            No account? <Link to="/register" className="font-bold text-bbc-red hover:underline">Register</Link>
          </p>
        </>
      )}
      </div>
    </div>
  );
}
