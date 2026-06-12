import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";

export default function ViewerCount({ streamId, initial = 0 }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (!streamId) return;

    socket.emit("join_stream_viewers", { streamId, userId: user?._id });

    const onCount = (data) => {
      if (String(data.streamId) === String(streamId)) {
        setCount(data.current ?? 0);
      }
    };

    socket.on("viewer_count", onCount);
    return () => {
      socket.emit("leave_stream_viewers", { streamId });
      socket.off("viewer_count", onCount);
    };
  }, [streamId, user?._id]);

  if (!streamId) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      <span>{count.toLocaleString()} {t("watching")}</span>
    </div>
  );
}
