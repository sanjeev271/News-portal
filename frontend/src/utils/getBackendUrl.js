/**
 * Resolves where the API / Socket.io backend lives.
 *
 * - localhost dev  → http://localhost:5000 (direct)
 * - LAN / mobile / port-forward → same page origin (Vite proxies /api and /socket.io)
 * - production     → same origin unless VITE_SOCKET_URL is set
 */
export function getBackendUrl() {
  const socketEnv = import.meta.env.VITE_SOCKET_URL;
  if (socketEnv) return socketEnv.replace(/\/$/, "");

  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const { hostname, protocol } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  if (import.meta.env.DEV && isLocal) {
    return `${protocol}//${hostname}:5000`;
  }

  // Mobile on LAN or port-forwarded URL — socket goes through Vite/nginx on same host
  return undefined;
}
