import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await register(name, email, password);
      setCreatedUser(data);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-bbc-red focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-red-900/30";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
      <div className="card-surface w-full max-w-md p-6 sm:p-10">
        <h2 className="mb-1 text-2xl font-extrabold text-slate-900 dark:text-white">{t("registerTitle")}</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{t("registerDesc")}</p>

        {createdUser ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="mb-1 text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {t("registerSuccess")}
            </p>
            <p className="text-emerald-700 dark:text-emerald-400">
              {t("registerWelcome", { name: createdUser.name })}
            </p>
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("registerName")}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("registerEmail")}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("registerPassword")}
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-base">
                {t("registerSubmit")}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              {t("registerHasAccount")}{" "}
              <Link to="/login" className="font-bold text-bbc-red hover:underline">{t("login")}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
