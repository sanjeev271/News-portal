import { getImageUrl } from "../utils/formatTime";

function normalizeYoutubeUrl(url) {
  if (!url) return url;
  if (url.includes("embed/")) return url;
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url.replace("watch?v=", "embed/").replace("&", "?");
}

export default function StreamPlayer({ url, title = "Stream", className = "" }) {
  if (!url) {
    return (
      <div className={`flex aspect-video items-center justify-center bg-black text-slate-400 ${className}`}>
        No stream URL configured
      </div>
    );
  }

  const isYoutube = url.includes("youtube") || url.includes("youtu.be");
  const isVideoFile = /\.(mp4|webm|ogg)$/i.test(url) || url.includes("/uploads/");

  return (
    <div className={`aspect-video overflow-hidden bg-black ${className}`}>
      {isYoutube ? (
        <iframe
          src={normalizeYoutubeUrl(url)}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={title}
        />
      ) : isVideoFile ? (
        <video src={getImageUrl(url)} controls className="h-full w-full" />
      ) : (
        <iframe src={url} className="h-full w-full" allowFullScreen title={title} />
      )}
    </div>
  );
}
