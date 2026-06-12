import { useRef, useCallback } from "react";
import socket from "../socket/socket";
import { waitForSocket } from "../socket/socketUtils";
import { getBroadcastMedia } from "../utils/mediaDevices";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function waitForIceGathering(pc) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const check = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", check);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", check);
    setTimeout(resolve, 2000);
  });
}

export default function useWebRTCBroadcast() {
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamIdRef = useRef(null);
  const handlersRef = useRef(null);
  const rejoinHandlerRef = useRef(null);

  const attachTracks = useCallback((viewerId) => {
    if (!mediaStreamRef.current) return null;

    if (peersRef.current.has(viewerId)) {
      peersRef.current.get(viewerId).close();
      peersRef.current.delete(viewerId);
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    mediaStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, mediaStreamRef.current);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice", { targetId: viewerId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        pc.close();
        peersRef.current.delete(viewerId);
      }
    };

    peersRef.current.set(viewerId, pc);
    return pc;
  }, []);

  const connectViewer = useCallback(async (viewerId) => {
    try {
      const existing = peersRef.current.get(viewerId);
      if (
        existing &&
        (existing.connectionState === "connected" ||
          existing.connectionState === "connecting" ||
          existing.signalingState === "have-local-offer")
      ) {
        return;
      }

      const pc = attachTracks(viewerId);
      if (!pc) return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);
      socket.emit("webrtc_offer", { viewerId, offer: pc.localDescription });
    } catch (err) {
      console.error("connectViewer failed:", err);
    }
  }, [attachTracks]);

  const attachLocalPreview = useCallback(() => {
    if (!localVideoRef.current || !mediaStreamRef.current) return;
    localVideoRef.current.srcObject = mediaStreamRef.current;
    localVideoRef.current.muted = true;
    localVideoRef.current.play().catch(() => {});
  }, []);

  const startCamera = useCallback(async () => {
    const media = await getBroadcastMedia();
    mediaStreamRef.current = media;
    attachLocalPreview();
    return media;
  }, [attachLocalPreview]);

  const startBroadcast = useCallback(async (streamId) => {
    const streamIdStr = String(streamId);
    streamIdRef.current = streamIdStr;

    await waitForSocket(socket);
    await startCamera();

    const onViewerJoined = ({ viewerId, streamId: sid }) => {
      if (String(sid) === streamIdStr) connectViewer(viewerId);
    };
    const onAnswer = async ({ answer, viewerId }) => {
      const pc = peersRef.current.get(viewerId);
      if (!pc || pc.signalingState !== "have-local-offer") return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.warn("WebRTC answer ignored:", err.message);
      }
    };
    const onIce = async ({ candidate, fromId }) => {
      const pc = peersRef.current.get(fromId);
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    handlersRef.current = { onViewerJoined, onAnswer, onIce };
    socket.on("viewer_joined", onViewerJoined);
    socket.on("webrtc_answer", onAnswer);
    socket.on("webrtc_ice", onIce);

    const rejoinRoom = () => {
      if (!streamIdRef.current) return;
      socket.emit("join_live_room", { streamId: streamIdRef.current, role: "broadcaster" });
    };
    rejoinHandlerRef.current = rejoinRoom;
    socket.on("connect", rejoinRoom);

    socket.emit("join_live_room", { streamId: streamIdStr, role: "broadcaster" });

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
    recorder.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    recorder.start(2000);
    recorderRef.current = recorder;

    return () => {
      const h = handlersRef.current;
      if (h) {
        socket.off("viewer_joined", h.onViewerJoined);
        socket.off("webrtc_answer", h.onAnswer);
        socket.off("webrtc_ice", h.onIce);
      }
      if (rejoinHandlerRef.current) {
        socket.off("connect", rejoinHandlerRef.current);
        rejoinHandlerRef.current = null;
      }
      handlersRef.current = null;
    };
  }, [connectViewer, startCamera]);

  const stopBroadcast = useCallback(() => {
    return new Promise((resolve) => {
      const finish = () => {
        peersRef.current.forEach((pc) => pc.close());
        peersRef.current.clear();
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        socket.emit("leave_live_room");
        streamIdRef.current = null;

        if (rejoinHandlerRef.current) {
          socket.off("connect", rejoinHandlerRef.current);
          rejoinHandlerRef.current = null;
        }

        if (chunksRef.current.length) {
          resolve(new Blob(chunksRef.current, { type: "video/webm" }));
        } else {
          resolve(null);
        }
        chunksRef.current = [];
      };

      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.onstop = finish;
        recorderRef.current.stop();
        recorderRef.current = null;
      } else {
        finish();
      }
    });
  }, []);

  return { localVideoRef, startBroadcast, stopBroadcast, startCamera, attachLocalPreview };
}
