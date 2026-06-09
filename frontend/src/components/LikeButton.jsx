import { useEffect, useState } from "react";
import API from "../api/axios";

export default function LikeButton({ articleId, initialLikes = 0, onLiked }) {
  const storageKey = `liked_${articleId}`;
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(() => sessionStorage.getItem(storageKey) === "1");
  const [loading, setLoading] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  const handleLike = async () => {
    if (loading || liked) return;

    setLoading(true);
    setPop(true);
    setLiked(true);
    setLikes((prev) => prev + 1);
    sessionStorage.setItem(storageKey, "1");

    try {
      const res = await API.post(`/likes/${articleId}`);
      setLikes(res.data.likes);
      onLiked?.(res.data.likes);
    } catch {
      setLiked(false);
      setLikes(initialLikes);
      sessionStorage.removeItem(storageKey);
    } finally {
      setLoading(false);
      setTimeout(() => setPop(false), 450);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading || liked}
      aria-label="Like article"
      className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
        liked
          ? "border-red-600 bg-red-600 text-white"
          : "border-red-200 bg-red-50 text-red-600 hover:border-red-400"
      }`}
    >
      <span className={pop ? "animate-[pop_0.45s_ease]" : ""}>{liked ? "❤️" : "🤍"}</span>
      <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
    </button>
  );
}
