import { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/axios";

export default function NewsletterSignup({ compact = false }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      await API.post("/newsletter/subscribe", { email });
      setStatus("success");
      setMessage(t("newsletterSuccess"));
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || t("newsletterError"));
    }
  };

  if (compact) {
    return (
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletterPlaceholder")}
          required
          className="min-h-[44px] flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-bbc-red"
        />
        <button type="submit" disabled={status === "loading"} className="btn-primary min-h-[44px] shrink-0 px-5">
          {status === "loading" ? "…" : t("subscribe")}
        </button>
        {message && <p className={`text-xs sm:basis-full ${status === "error" ? "text-red-400" : "text-green-400"}`}>{message}</p>}
      </form>
    );
  }

  return (
    <section className="border-b border-slate-200 bg-gradient-to-br from-red-50 to-white py-10 dark:border-slate-800 dark:from-red-950/20 dark:to-slate-950 sm:py-12">
      <div className="mx-auto max-w-2xl px-3 text-center sm:px-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">{t("newsletterTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("newsletterDesc")}</p>
        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletterPlaceholder")}
            required
            className="min-h-[48px] flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
          <button type="submit" disabled={status === "loading"} className="btn-primary min-h-[48px] px-6">
            {status === "loading" ? "…" : t("subscribe")}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-green-600"}`}>{message}</p>
        )}
      </div>
    </section>
  );
}
