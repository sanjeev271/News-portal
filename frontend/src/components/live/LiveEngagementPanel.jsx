import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import socket from "../../socket/socket";

const REACTIONS = ["👍", "❤️", "🔥", "😮", "👏", "📰"];

export default function LiveEngagementPanel({ roomId }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState("chat");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [poll, setPoll] = useState(null);
  const [qa, setQa] = useState([]);
  const [question, setQuestion] = useState("");
  const [reactions, setReactions] = useState({});
  const [myReaction, setMyReaction] = useState(null);
  const [bursts, setBursts] = useState([]);
  const chatEndRef = useRef(null);
  const voterKey = user?._id || null;

  useEffect(() => {
    if (!roomId) return undefined;

    socket.emit("join_live_engagement", { roomId, userId: voterKey });

    const onState = (data) => {
      setChat(data.chat || []);
      setPoll(data.polls?.[0] || null);
      setQa(data.qa || []);
      setReactions(data.reactions || {});
      setMyReaction(data.userReaction || null);
    };
    const onChat = (msg) => setChat((prev) => [...prev.slice(-99), msg]);
    const onPoll = (data) => {
      setPoll((p) =>
        p
          ? { ...p, options: data.options }
          : { id: data.pollId, question: "Poll", options: data.options }
      );
    };
    const onReaction = (data) => {
      setReactions(data.counts || {});
      setBursts((prev) => [...prev, { id: Date.now(), emoji: data.emoji }].slice(-6));
    };
    const onQA = (entry) => setQa((prev) => [...prev.slice(-49), entry]);

    socket.on("live_engagement_state", onState);
    socket.on("live_chat_message", onChat);
    socket.on("live_poll_updated", onPoll);
    socket.on("live_reaction_burst", onReaction);
    socket.on("live_qa_added", onQA);

    return () => {
      socket.emit("leave_live_engagement", { roomId });
      socket.off("live_engagement_state", onState);
      socket.off("live_chat_message", onChat);
      socket.off("live_poll_updated", onPoll);
      socket.off("live_reaction_burst", onReaction);
      socket.off("live_qa_added", onQA);
    };
  }, [roomId, voterKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendChat = (e) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    socket.emit("live_chat_send", {
      roomId,
      message,
      user: { id: user._id, name: user.name },
    });
    setMessage("");
  };

  const sendReaction = (emoji) => {
    if (!user || myReaction === emoji) return;
    socket.emit("live_reaction", { roomId, emoji, userId: voterKey });
    setMyReaction(emoji);
  };

  const vote = (optionId) => {
    if (!user) return;
    socket.emit("live_poll_vote", {
      roomId,
      pollId: poll?.id || "default",
      optionId,
      voterId: voterKey,
    });
  };

  const submitQA = (e) => {
    e.preventDefault();
    if (!user || !question.trim()) return;
    socket.emit("live_qa_submit", {
      roomId,
      question,
      user: { id: user._id, name: user.name },
    });
    setQuestion("");
  };

  const tabs = [
    { id: "chat", label: t("liveChat") },
    { id: "poll", label: t("livePoll") },
    { id: "qa", label: t("liveQA") },
  ];

  return (
    <section className="sidebar-card overflow-hidden">
      <h2 className="bbc-section-title mb-3 text-base dark:text-white">{t("liveEngagement")}</h2>

      <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={`shrink-0 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide ${
              tab === tb.id ? "bg-bbc-red text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <p className="text-meta mb-2">{t("oneReactionOnly")}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {REACTIONS.map((emoji) => {
          const selected = myReaction === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => sendReaction(emoji)}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-2.5 text-lg transition ${
                selected
                  ? "border-bbc-red bg-bbc-red/10 ring-2 ring-bbc-red/40"
                  : "border-slate-200 hover:scale-105 dark:border-slate-600"
              }`}
              title={t("react")}
              aria-pressed={selected}
            >
              {emoji}
              {reactions[emoji] ? (
                <span className="ml-1 text-[10px] font-bold text-slate-500">{reactions[emoji]}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {bursts.length > 0 && (
        <div className="pointer-events-none mb-2 flex gap-1 overflow-hidden">
          {bursts.map((b) => (
            <span key={b.id} className="animate-bounce text-xl">{b.emoji}</span>
          ))}
        </div>
      )}

      {tab === "chat" && (
        <>
          <div className="mb-3 max-h-48 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3 sm:max-h-56 dark:bg-slate-900/50">
            {chat.length === 0 && <p className="text-xs text-slate-400">{t("noChatYet")}</p>}
            {chat.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="font-bold text-bbc-red">{msg.user}</span>
                <span className="ml-2 break-words text-slate-700 dark:text-slate-300">{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChat} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={user ? t("chatPlaceholder") : t("signInToChat")}
              className="input-field min-h-[44px] flex-1 text-sm"
              maxLength={500}
              disabled={!user}
            />
            {user ? (
              <button type="submit" className="btn-primary min-h-[44px] shrink-0 px-4 text-sm">{t("send")}</button>
            ) : (
              <Link to="/login" className="btn-primary flex min-h-[44px] shrink-0 items-center justify-center px-4 text-sm">
                {t("signIn")}
              </Link>
            )}
          </form>
        </>
      )}

      {tab === "poll" && poll && (
        <div>
          <p className="mb-3 text-sm font-bold dark:text-white">{poll.question}</p>
          <div className="space-y-2">
            {poll.options?.map((opt) => {
              const total = poll.options.reduce((s, o) => s + o.votes, 0) || 1;
              const pct = Math.round((opt.votes / total) * 100);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => vote(opt.id)}
                  className="relative w-full min-h-[44px] overflow-hidden rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm dark:border-slate-700"
                >
                  <span className="absolute inset-y-0 left-0 bg-bbc-red/15" style={{ width: `${pct}%` }} />
                  <span className="relative flex justify-between gap-2">
                    <span>{opt.text}</span>
                    <span className="shrink-0 font-bold text-bbc-red">{pct}%</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "qa" && (
        <>
          <div className="mb-3 max-h-40 space-y-2 overflow-y-auto sm:max-h-48">
            {qa.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-2.5 text-sm dark:border-slate-700">
                <p className="font-medium dark:text-white">{item.question}</p>
                <p className="text-meta mt-1">{item.user}</p>
              </div>
            ))}
          </div>
          <form onSubmit={submitQA} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={user ? t("askQuestion") : t("signInToChat")}
              className="input-field min-h-[44px] flex-1 text-sm"
              disabled={!user}
            />
            {user ? (
              <button type="submit" className="btn-outline min-h-[44px] shrink-0 px-4 text-sm">{t("ask")}</button>
            ) : (
              <Link to="/login" className="btn-outline flex min-h-[44px] shrink-0 items-center justify-center px-4 text-sm">
                {t("signIn")}
              </Link>
            )}
          </form>
        </>
      )}
    </section>
  );
}
