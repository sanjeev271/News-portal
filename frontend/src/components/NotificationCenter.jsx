import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import socket from "../socket/socket";
import { formatTime } from "../utils/formatTime";

export default function NotificationCenter() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(() => {
    if (!isLoggedIn) return;
    API.get("/notifications")
      .then((res) => {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const onNotification = (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    };

    socket.on("notification", onNotification);
    socket.on("breaking_news", onNotification);
    socket.on("live_started", (data) => {
      onNotification({
        type: "live_started",
        title: t("liveNow"),
        message: data.title,
        link: data.slug ? `/live-event/${data.slug}` : "/live-tv",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      socket.off("notification", onNotification);
      socket.off("breaking_news", onNotification);
      socket.off("live_started");
    };
  }, [isLoggedIn, t]);

  const handleClick = async (n) => {
    if (n._id && !n.isRead) {
      await API.patch(`/notifications/${n._id}/read`).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await API.patch("/notifications/read-all").catch(() => {});
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (!isLoggedIn) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label={t("notifications")}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bbc-red px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("notifications")}</h3>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs font-semibold text-bbc-red hover:underline">
                  {t("markAllRead")}
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-slate-400">{t("noNotifications")}</li>
              ) : (
                notifications.map((n, i) => (
                  <li key={n._id || i}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        !n.isRead ? "bg-red-50/50 dark:bg-red-950/10" : ""
                      }`}
                    >
                      <div className="text-xs font-bold text-bbc-red">{n.title}</div>
                      <div className="mt-0.5 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">{n.message}</div>
                      {n.createdAt && (
                        <div className="mt-1 text-[10px] text-slate-400">{formatTime(n.createdAt)}</div>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
