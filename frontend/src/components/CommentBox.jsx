import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import socket from "../socket/socket";
import { formatTime, getInitials } from "../utils/formatTime";

export default function CommentBox({ articleId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [newIds, setNewIds] = useState(new Set());

  useEffect(() => {
    fetchComments();

    const onNewComment = (data) => {
      const matchId = data.article?.toString?.() || data.article?._id?.toString?.();
      if (matchId !== articleId?.toString()) return;

      setComments((prev) => {
        if (prev.some((c) => c._id === data._id)) return prev;
        return [data, ...prev];
      });

      setNewIds((prev) => new Set(prev).add(data._id));
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(data._id);
          return next;
        });
      }, 3000);
    };

    socket.on("new_comment", onNewComment);
    return () => socket.off("new_comment", onNewComment);
  }, [articleId]);

  const fetchComments = async () => {
    const res = await API.get(`/comments/${articleId}`);
    setComments(res.data);
  };

  const sendComment = async () => {
    if (!text.trim() || sending) return;
    setError("");
    setSending(true);
    try {
      const res = await API.post("/comments", { article: articleId, text });
      setComments((prev) => {
        if (prev.some((c) => c._id === res.data._id)) return prev;
        return [res.data, ...prev];
      });
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  };

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <h3 className="text-lg font-bold text-slate-900">Comments ({comments.length})</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 animate-[pulse-dot_1.5s_ease_infinite] rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {user ? (
        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts…"
            disabled={sending}
            className="min-h-[48px] flex-1 rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-bbc-red focus:ring-2 focus:ring-red-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
          />
          <button
            onClick={sendComment}
            disabled={sending || !text.trim()}
            className="btn-primary min-h-[48px] w-full px-5 py-3 sm:w-auto"
          >
            {sending ? "…" : "Post"}
          </button>
        </div>
      ) : (
        <div className="mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link> to join the conversation.
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="divide-y divide-slate-100">
        {comments.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className={`flex gap-3 py-4 animate-[slideIn_0.35s_ease] ${
                newIds.has(c._id) ? "-mx-3 rounded-lg bg-emerald-50 px-3" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
                {getInitials(c.user?.name)}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{c.user?.name || "Anonymous"}</div>
                <div className="text-sm text-slate-600">{c.text}</div>
                <div className="mt-1 text-xs text-slate-400">{formatTime(c.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
