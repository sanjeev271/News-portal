import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import socket from "../socket/socket";

const NotificationContext = createContext(null);

let idCounter = 0;

const borderColors = {
  breaking: "border-l-bbc-red",
  live: "border-l-red-600",
  article: "border-l-blue-500",
};

export function NotificationProvider({ children }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const addNotification = useCallback((notification) => {
    const id = ++idCounter;
    setNotifications((prev) => [
      { id, ...notification, exiting: false },
      ...prev.slice(0, 3),
    ]);

    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, exiting: true } : n))
      );
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 300);
    }, 6000);
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, exiting: true } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    const onNewArticle = (data) => {
      if (data.status !== "published" || !data.isBreaking) return;
      addNotification({
        type: "breaking",
        title: t("breakingAlert"),
        message: data.title,
        link: data.slug ? `/article/${data.slug}` : null,
      });
    };

    const onBreaking = (data) => {
      addNotification({
        type: "breaking",
        title: t("breakingAlert"),
        message: data.title || data.message,
        link: data.link || (data.slug ? `/article/${data.slug}` : null),
      });
    };

    const onPush = (data) => {
      addNotification({
        type: data.isBreaking ? "breaking" : "article",
        title: data.title || t("newStory"),
        message: data.message || "",
        link: data.link || null,
      });
    };

    const onLive = (data) => {
      if (data.status === "live") {
        addNotification({
          type: "live",
          title: t("liveNow"),
          message: data.title,
          link: data.slug ? `/live-event/${data.slug}` : "/live-tv",
        });
      } else if (data.status === "ended") {
        addNotification({
          type: "article",
          title: t("liveEnded"),
          message: data.title,
          link: "/live-tv",
        });
      }
    };

    const onLiveStarted = (data) => {
      addNotification({
        type: "live",
        title: t("liveNow"),
        message: data.title,
        link: data.slug ? `/live-event/${data.slug}` : "/live",
      });
    };

    socket.on("new_article", onNewArticle);
    socket.on("article_published", onNewArticle);
    socket.on("breaking_news", onBreaking);
    socket.on("push_notification", onPush);
    socket.on("live_status", onLive);
    socket.on("live_started", onLiveStarted);
    socket.on("notification", onPush);

    return () => {
      socket.off("new_article", onNewArticle);
      socket.off("article_published", onNewArticle);
      socket.off("breaking_news", onBreaking);
      socket.off("push_notification", onPush);
      socket.off("live_status", onLive);
      socket.off("live_started", onLiveStarted);
      socket.off("notification", onPush);
    };
  }, [addNotification, t]);

  const handleClick = (n) => {
    dismiss(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <NotificationContext.Provider value={{ addNotification, dismiss }}>
      {children}
      <div className="pointer-events-none fixed right-3 top-16 z-[9999] flex flex-col gap-2 sm:right-5 sm:top-20">
        {notifications.map((n) => (
          <div
            key={n.id}
            role="status"
            onClick={() => handleClick(n)}
            className={`pointer-events-auto flex w-[min(100vw-1.5rem,20rem)] cursor-pointer items-start gap-3 rounded-xl border-l-4 bg-white p-3.5 shadow-xl dark:bg-slate-900 ${
              borderColors[n.type] || "border-l-slate-400"
            } ${n.exiting ? "translate-x-10 opacity-0 transition-all duration-300" : "animate-[toastIn_0.35s_cubic-bezier(0.34,1.56,0.64,1)]"}`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black uppercase tracking-wide text-bbc-red">{n.title}</div>
              <div className="mt-0.5 line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">{n.message}</div>
            </div>
            <button
              type="button"
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Dismiss"
              onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
