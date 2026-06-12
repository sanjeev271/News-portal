import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";
import { waitForSocket } from "../socket/socketUtils";
import { playVideoStream } from "../utils/playVideoStream";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export default function useWebRTCViewer(streamId, enabled) {
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const broadcasterIdRef = useRef(null);
  const pendingCandidates = useRef([]);
  const [connected, setConnected] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [error, setError] = useState("");
  const connectedRef = useRef(false);
  const streamIdStr = streamId ? String(streamId) : null;

  useEffect(() => {
    if (!enabled || !streamIdStr) return undefined;

    let active = true;
    let pingTimer = null;
    connectedRef.current = false;
    setConnected(false);
    setNeedsTap(false);
    setError("");

    const handlers = {};

    const cleanup = () => {
      active = false;
      connectedRef.current = false;
      setConnected(false);
      setNeedsTap(false);
      if (pingTimer) clearInterval(pingTimer);
      socket.emit("leave_live_room");
      socket.off("webrtc_offer", handlers.onOffer);
      socket.off("webrtc_ice", handlers.onIce);
      socket.off("broadcaster_ready", handlers.onBroadcasterReady);
      socket.off("broadcaster_waiting", handlers.onBroadcasterWaiting);
      socket.off("connect", handlers.onReconnect);
      pcRef.current?.close();
      pcRef.current = null;
      broadcasterIdRef.current = null;
      pendingCandidates.current = [];
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };

    const flushCandidates = async () => {
      const pc = pcRef.current;
      if (!pc?.remoteDescription) return;
      while (pendingCandidates.current.length) {
        const candidate = pendingCandidates.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    };

    const playRemote = async (stream) => {
      const video = remoteVideoRef.current;
      if (!video || !active) return;

      const result = await playVideoStream(video, stream, { startMuted: true });
      if (!active) return;

      if (result === false) {
        setError("Tap the video to start playback");
        setNeedsTap(true);
        return;
      }

      connectedRef.current = true;
      setConnected(true);
      setError("");

      if (result === "muted") {
        setNeedsTap(true);
      } else {
        try {
          video.muted = false;
          await video.play();
          setNeedsTap(false);
        } catch {
          setNeedsTap(true);
        }
      }
    };

    handlers.onOffer = async ({ offer, broadcasterId }) => {
      if (!active) return;
      if (connectedRef.current || pcRef.current?.connectionState === "connected") return;
      try {
        broadcasterIdRef.current = broadcasterId;
        pcRef.current?.close();

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        pc.ontrack = (event) => {
          const stream =
            event.streams?.[0] ||
            (event.track ? new MediaStream([event.track]) : null);
          if (stream) playRemote(stream);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && broadcasterIdRef.current) {
            socket.emit("webrtc_ice", {
              targetId: broadcasterIdRef.current,
              candidate: event.candidate,
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (!active) return;
          if (pc.connectionState === "failed") {
            setError("Connection failed — check network or try again");
            connectedRef.current = false;
            setConnected(false);
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc_answer", { broadcasterId, answer });
      } catch (err) {
        console.error("WebRTC viewer offer failed:", err);
        setError("Could not connect to live stream");
      }
    };

    handlers.onIce = async ({ candidate }) => {
      if (!candidate) return;
      if (pcRef.current?.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    const requestConnection = () => {
      if (!active || connectedRef.current) return;
      if (pcRef.current?.connectionState === "connected") return;
      socket.emit("viewer_ping", { streamId: streamIdStr });
    };

    handlers.onBroadcasterReady = ({ streamId: sid }) => {
      if (String(sid) === streamIdStr) requestConnection();
    };

    handlers.onBroadcasterWaiting = () => {
      setTimeout(requestConnection, 1000);
    };

    handlers.onReconnect = () => {
      if (!active) return;
      connectedRef.current = false;
      setConnected(false);
      socket.emit("join_live_room", { streamId: streamIdStr, role: "viewer" });
      requestConnection();
    };

    const start = async () => {
      try {
        await waitForSocket(socket);
        if (!active) return;

        socket.on("webrtc_offer", handlers.onOffer);
        socket.on("webrtc_ice", handlers.onIce);
        socket.on("broadcaster_ready", handlers.onBroadcasterReady);
        socket.on("broadcaster_waiting", handlers.onBroadcasterWaiting);
        socket.on("connect", handlers.onReconnect);

        socket.emit("join_live_room", { streamId: streamIdStr, role: "viewer" });
        requestConnection();
        pingTimer = setInterval(requestConnection, 8000);
      } catch (err) {
        setError(err.message || "Cannot reach live server");
      }
    };

    start();

    return cleanup;
  }, [streamIdStr, enabled]);

  const tapToPlay = async () => {
    const video = remoteVideoRef.current;
    if (!video) return;
    try {
      video.muted = false;
      await video.play();
      setNeedsTap(false);
      setError("");
      connectedRef.current = true;
      setConnected(true);
    } catch {
      video.muted = true;
      await video.play().catch(() => {});
    }
  };

  return { remoteVideoRef, connected, needsTap, error, tapToPlay };
}
