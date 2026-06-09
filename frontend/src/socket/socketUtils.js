export function waitForSocket(socket, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      socket.off("connect", onConnect);
      reject(new Error("Could not connect to live server. Is the backend running on port 5000?"));
    }, timeoutMs);

    const onConnect = () => {
      clearTimeout(timer);
      resolve();
    };

    socket.once("connect", onConnect);
    if (!socket.active) socket.connect();
  });
}
