import { io } from "socket.io-client";
import { getBackendUrl } from "../utils/getBackendUrl";

const SOCKET_URL = getBackendUrl();

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on("connect_error", (err) => {
  console.warn(
    "[socket] Connection failed —",
    SOCKET_URL || window.location.origin,
    err.message
  );
});

export default socket;
