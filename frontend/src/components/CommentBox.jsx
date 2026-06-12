import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import socket from "../socket/socket";
import { formatTime, getInitials } from "../utils/formatTime";

function CommentItem({ comment, articleId, articleSlug, onReply, depth = 0 }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const sendReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      await API.post("/comments", {
        article: articleId,
        text: replyText,
        parent: comment._id,
        articleSlug,
      });
      setReplyText("");
      setReplying(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-slate-100 pl-4 dark:border-slate-800" : ""}>
      <div className="flex gap-3 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
          {getInitials(comment.user?.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {comment.user?.name || "Anonymous"}
            {comment.isEdited && <span className="ml-2 text-xs text-slate-400">(edited)</span>}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{comment.text}</div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>{formatTime(comment.createdAt)}</span>
            {user && depth < 2 && (
              <button type="button" onClick={() => setReplying(!replying)} className="font-semibold text-bbc-red hover:underline">
                Reply
              </button>
            )}
          </div>
          {replying && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
              <button type="button" onClick={sendReply} disabled={sending} className="btn-primary px-3 py-2 text-sm">
                Reply
              </button>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((r) => (
        <CommentItem
          key={r._id}
          comment={r}
          articleId={articleId}
          articleSlug={articleSlug}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function CommentBox({ articleId, articleSlug }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [newIds, setNewIds] = useState(new Set());

  const fetchComments = async () => {
    const res = await API.get(`/comments/${articleId}`);
    setComments(res.data.comments || res.data);
  };

  useEffect(() => {
    fetchComments();

    const onNewComment = (data) => {
      const matchId = data.article?.toString?.() || data.article?._id?.toString?.();
      if (matchId !== articleId?.toString()) return;
      fetchComments();
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
    socket.on("comment_added", onNewComment);
    return () => {
      socket.off("new_comment", onNewComment);
      socket.off("comment_added", onNewComment);
    };
  }, [articleId]);

  const sendComment = async () => {
    if (!text.trim() || sending) return;
    setError("");
    setSending(true);
    try {
      await API.post("/comments", { article: articleId, text, articleSlug });
      setText("");
      fetchComments();
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

  const countReplies = (list) =>
    list.reduce((n, c) => n + 1 + (c.replies?.length ? countReplies(c.replies) : 0), 0);

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {t("comments")} ({countReplies(comments)})
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <span className="h-2 w-2 animate-[pulse-dot_1.5s_ease_infinite] rounded-full bg-emerald-500" />
          {t("live")}
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
          <button onClick={sendComment} disabled={sending || !text.trim()} className="btn-primary min-h-[48px] w-full px-5 py-3 sm:w-auto">
            {sending ? "…" : "Post"}
          </button>
        </div>
      ) : (
        <div className="mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900">
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">{t("signIn")}</Link> to join the conversation.
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {comments.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No comments yet. Be the first!</div>
        ) : (
          comments.map((c) => (
            <div key={c._id} className={newIds.has(c._id) ? "-mx-3 rounded-lg bg-emerald-50 px-3 dark:bg-emerald-950/20" : ""}>
              <CommentItem comment={c} articleId={articleId} articleSlug={articleSlug} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
