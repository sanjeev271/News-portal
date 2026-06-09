import { useEffect, useRef, useState } from "react";
import API from "../../api/axios";
import { LocalCameraPreview } from "../../components/CameraPlayer";
import LiveStreamView from "../../components/LiveStreamView";
import useWebRTCBroadcast from "../../hooks/useWebRTCBroadcast";
import socket from "../../socket/socket";
import { formatTime } from "../../utils/formatTime";
import { formatMediaError } from "../../utils/mediaDevices";

export default function AdminLive() {
  const [streams, setStreams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [previewMode, setPreviewMode] = useState("live");
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [loadError, setLoadError] = useState("");
  const cleanupRef = useRef(null);
  const { localVideoRef, startBroadcast, stopBroadcast, startCamera, attachLocalPreview } = useWebRTCBroadcast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    streamType: "url",
    streamUrl: "",
    recordingUrl: "",
  });

  const load = () =>
    API.get("/live")
      .then((r) => {
        setStreams(r.data);
        setLoadError("");
        if (selected) {
          const updated = r.data.find((s) => s._id === selected._id);
          if (updated) setSelected(updated);
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Could not load broadcasts";
        setLoadError(msg);
      });

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onLiveStatus = (data) => {
      setStreams((prev) => prev.map((s) => (s._id === data._id ? data : s)));
      setSelected((prev) => (prev?._id === data._id ? data : prev));
    };
    socket.on("live_status", onLiveStatus);
    return () => socket.off("live_status", onLiveStatus);
  }, []);

  useEffect(() => {
    if (cameraActive) attachLocalPreview();
  }, [cameraActive, attachLocalPreview]);

  const create = async (e) => {
    e.preventDefault();
    setLoadError("");
    try {
      const res = await API.post("/live", {
        title: form.title,
        description: form.description,
        streamType: form.streamType,
        streamUrl: form.streamType === "url" ? form.streamUrl : "",
        recordingUrl: form.recordingUrl,
      });
      setForm({ title: "", description: "", streamType: "url", streamUrl: "", recordingUrl: "" });
      setSelected(res.data);
      load();
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not create broadcast");
    }
  };

  const uploadRecordingBlob = async (id, blob) => {
    if (!blob) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("recording", blob, `live-recording-${Date.now()}.webm`);
      const res = await API.post(`/live/${id}/recording`, data);
      setSelected(res.data);
      load();
    } finally {
      setUploading(false);
    }
  };

  const goLiveWithCamera = async (stream) => {
    setCameraError("");
    setSelected(stream);
    setPreviewMode("live");
    setCameraActive(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const cleanup = await startBroadcast(stream._id);
      cleanupRef.current = cleanup;
      attachLocalPreview();
      const res = await API.put(`/live/${stream._id}`, {
        status: "live",
        streamType: "camera",
        streamUrl: "",
      });
      setSelected(res.data);
      load();
    } catch (err) {
      await stopBroadcast().catch(() => {});
      cleanupRef.current?.();
      cleanupRef.current = null;
      setCameraActive(false);
      const msg = formatMediaError(err);
      setCameraError(
        msg.includes("live server") || msg.includes("port 5000")
          ? `${msg} Start the backend with: cd backend && npm run dev`
          : msg
      );
    }
  };

  const endCameraStream = async (stream) => {
    const blob = await stopBroadcast();
    cleanupRef.current?.();
    cleanupRef.current = null;
    setCameraActive(false);
    await API.put(`/live/${stream._id}`, { status: "ended" });
    if (blob) await uploadRecordingBlob(stream._id, blob);
    load();
  };

  const goLiveUrl = async (id) => {
    const target = streams.find((s) => s._id === id);
    await API.put(`/live/${id}`, {
      status: "live",
      streamType: "url",
      streamUrl: target?.streamUrl || "",
    });
    setPreviewMode("live");
    load();
  };

  const endStream = async (stream) => {
    if (stream.streamType === "camera" && cameraActive) {
      await endCameraStream(stream);
      return;
    }
    await API.put(`/live/${stream._id}`, { status: "ended" });
    load();
  };

  const remove = async (id) => {
    if (cameraActive && selected?._id === id) {
      await stopBroadcast();
      cleanupRef.current?.();
      setCameraActive(false);
    }
    await API.delete(`/live/${id}`);
    if (selected?._id === id) setSelected(null);
    load();
  };

  const uploadRecording = async (id, file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("recording", file);
      const res = await API.post(`/live/${id}/recording`, data);
      setSelected(res.data);
      load();
    } finally {
      setUploading(false);
    }
  };

  const testCamera = async () => {
    setCameraError("");
    try {
      await startCamera();
    } catch (err) {
      setCameraError(formatMediaError(err));
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold dark:text-white">Live Broadcast Control</h1>
      <p className="mb-6 text-sm text-slate-500">
        Stream via external URL or broadcast directly from your device camera with WebRTC.
      </p>

      {loadError && (
        <div className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loadError}
          {loadError.includes("admin") && (
            <span> — log out and sign in with <strong>admin@newsportal.com</strong> / <strong>admin123</strong></span>
          )}
        </div>
      )}

      {cameraError && (
        <div className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{cameraError}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-2">
          <form onSubmit={create} className="space-y-3 border border-slate-200 p-5 dark:border-slate-700">
            <h2 className="font-bold dark:text-white">Schedule New Broadcast</h2>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Broadcast title"
              required
              className="w-full border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={2}
              className="w-full border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <select
              value={form.streamType}
              onChange={(e) => setForm({ ...form, streamType: e.target.value })}
              className="w-full border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="url">External URL (YouTube / HLS)</option>
              <option value="camera">Device Camera (WebRTC)</option>
            </select>
            {form.streamType === "url" && (
              <input
                value={form.streamUrl}
                onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                placeholder="Live stream URL"
                className="w-full border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            )}
            {form.streamType === "camera" && (
              <p className="text-xs text-slate-500">
                After scheduling, select the broadcast and click &quot;Start Camera &amp; Go Live&quot;.
                Requires a connected webcam and browser permission. No camera? Use External URL (YouTube) instead.
              </p>
            )}
            <input
              value={form.recordingUrl}
              onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
              placeholder="Recording URL (optional replay link)"
              className="w-full border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <button type="submit" className="bg-bbc-red px-4 py-2 text-sm font-bold text-white">
              Schedule Broadcast
            </button>
          </form>

          <div className="space-y-2">
            <h2 className="font-bold dark:text-white">All Broadcasts</h2>
            {streams.map((s) => (
              <div
                key={s._id}
                onClick={() => {
                  setSelected(s);
                  setPreviewMode(
                    s.status === "live" || (s.streamType === "url" && s.streamUrl)
                      ? "live"
                      : s.recordingUrl
                        ? "recording"
                        : "live"
                  );
                }}
                className={`cursor-pointer border p-4 transition dark:border-slate-700 ${
                  selected?._id === s._id ? "border-bbc-red bg-red-50 dark:bg-red-950/20" : "hover:border-slate-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold dark:text-white">{s.title}</p>
                    <span className={`text-xs font-bold uppercase ${s.status === "live" ? "text-bbc-red" : "text-slate-500"}`}>
                      {s.status === "live" ? "● Live now" : s.status}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">
                      {s.streamType === "camera" ? "📷 Camera" : "🔗 URL"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {s.status !== "live" && s.streamType === "camera" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); goLiveWithCamera(s); }}
                        className="text-xs font-bold text-bbc-red"
                      >
                        Start Camera & Go Live
                      </button>
                    )}
                    {s.status !== "live" && s.streamType !== "camera" && (
                      <button onClick={(e) => { e.stopPropagation(); goLiveUrl(s._id); }} className="text-xs font-bold text-bbc-red">
                        Go Live
                      </button>
                    )}
                    {s.status === "live" && (
                      <button onClick={(e) => { e.stopPropagation(); endStream(s); }} className="text-xs font-bold text-slate-600">
                        End
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); remove(s._id); }} className="text-xs text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 p-5 dark:border-slate-700 xl:col-span-3">
          <h2 className="mb-4 font-bold dark:text-white">Preview Panel</h2>
          {selected ? (
            <>
              <div className="mb-3 flex flex-wrap gap-2">
                {(selected.streamType === "camera" || selected.streamUrl) && (
                  <button
                    onClick={() => setPreviewMode("live")}
                    className={`px-3 py-1.5 text-xs font-bold ${
                      previewMode === "live" ? "bg-bbc-red text-white" : "border border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {selected.streamType === "camera" ? "Live Camera" : "Live Stream"}
                  </button>
                )}
                {(selected.recordingUrl || (selected.streamType === "camera" && selected.status === "ended")) && (
                  <button
                    onClick={() => setPreviewMode("recording")}
                    className={`px-3 py-1.5 text-xs font-bold ${
                      previewMode === "recording" ? "bg-bbc-black text-white" : "border border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    Recording / Replay
                  </button>
                )}
                {selected.status === "live" && <span className="bbc-live-badge ml-auto">Live</span>}
              </div>

              {cameraActive && selected.streamType === "camera" ? (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-bold uppercase text-bbc-red">Your camera (broadcasting)</p>
                  <LocalCameraPreview videoRef={localVideoRef} onVideoMount={attachLocalPreview} />
                </div>
              ) : (
                <LiveStreamView stream={selected} mode={previewMode} className="mb-4" />
              )}

              <h3 className="text-lg font-bold dark:text-white">{selected.title}</h3>
              {selected.description && <p className="mt-1 text-sm text-slate-500">{selected.description}</p>}

              {selected.streamType === "camera" && !cameraActive && selected.status !== "live" && (
                <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <button onClick={testCamera} className="mb-2 text-sm font-bold text-bbc-red">
                    Test Camera Preview
                  </button>
                  <LocalCameraPreview videoRef={localVideoRef} onVideoMount={attachLocalPreview} />
                </div>
              )}

              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                <label className="mb-2 block text-sm font-bold dark:text-white">Upload Recording File</label>
                <input
                  type="file"
                  accept="video/*"
                  disabled={uploading}
                  onChange={(e) => uploadRecording(selected._id, e.target.files[0])}
                  className="text-sm"
                />
                {uploading && <p className="mt-2 text-xs text-bbc-red">Uploading…</p>}
                {selected.recordingUrl && (
                  <p className="mt-2 text-xs text-green-600">Recording saved — viewers can replay after broadcast ends.</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
              Select a broadcast to preview or start camera streaming
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
