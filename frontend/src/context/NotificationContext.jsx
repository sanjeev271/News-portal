import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";

const NotificationContext = createContext(null);

let idCounter = 0;

const borderColors = {
  article: "border-l-blue-500",
  comment: "border-l-emerald-500",
  like: "border-l-red-500"
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const addNotification = useCallback((notification) => {
    const id = ++idCounter;
    setNotifications((prev) => [
      { id, ...notification, exiting: false },
      ...prev.slice(0, 4)
    ]);

    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, exiting: true } : n))
      );
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 300);
    }, 4500);
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
      addNotification({
        type: "article",
        icon: "📰",
        title: "New Article Published",
        message: data.title,
        link: data.slug ? `/article/${data.slug}` : null
      });
    };

    const onNewComment = (data) => {
      addNotification({
        type: "comment",
        icon: "💬",
        title: "New Comment",
        message: `${data.user?.name || "Someone"}: ${data.text?.slice(0, 60)}${data.text?.length > 60 ? "…" : ""}`
      });
    };

    const onLiked = () => {
      addNotification({
        type: "like",
        icon: "❤️",
        title: "Article Liked",
        message: "Someone liked an article"
      });
    };

    const onPush = (data) => {
      addNotification({
        type: "article",
        icon: "🔔",
        title: data.title || "Notification",
        message: data.message || ""
      });
    };

    const onLive = (data) => {
      if (data.status === "live") {
        addNotification({ type: "article", icon: "📺", title: "Live Now", message: data.title, link: "/live" });
      }
    };

    socket.on("new_article", onNewArticle);
    socket.on("new_comment", onNewComment);
    socket.on("article_liked", onLiked);
    socket.on("push_notification", onPush);
    socket.on("live_status", onLive);

    return () => {
      socket.off("new_article", onNewArticle);
      socket.off("new_comment", onNewComment);
      socket.off("article_liked", onLiked);
      socket.off("push_notification", onPush);
      socket.off("live_status", onLive);
    };
  }, [addNotification]);

  const handleClick = (n) => {
    dismiss(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <NotificationContext.Provider value={{ addNotification, dismiss }}>
      {children}
      <div className="fixed right-4 top-20 z-[9999] flex flex-col gap-2.5 sm:right-5">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className={`flex w-80 max-w-[calc(100vw-2rem)] cursor-pointer items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-xl transition hover:-translate-x-1 ${
              borderColors[n.type] || "border-l-slate-400"
            } ${n.exiting ? "opacity-0 translate-x-10 transition-all duration-300" : "animate-[toastIn_0.35s_cubic-bezier(0.34,1.56,0.64,1)]"}`}
          >
            <span className="text-xl">{n.icon}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">{n.title}</div>
              <div className="text-xs text-slate-500">{n.message}</div>
            </div>
            <button
              className="text-slate-400 hover:text-slate-600"
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
