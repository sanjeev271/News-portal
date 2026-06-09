export async function getBroadcastMedia() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(
      new Error("Camera access is not available. Use http://localhost:5173 or HTTPS in production."),
      { name: "SecurityError" }
    );
  }

  const attempts = [
    { video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true },
    { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true },
    { video: true, audio: true },
    { video: true, audio: false },
  ];

  let lastError = null;

  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      lastError = err;
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        throw err;
      }
    }
  }

  throw lastError || new Error("Could not access camera");
}

export async function listVideoInputs() {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === "videoinput");
}

export function formatMediaError(err) {
  const name = err?.name || "";
  const msg = (err?.message || "").toLowerCase();

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera/microphone blocked. Click the lock icon in the browser address bar and allow camera + microphone, then try again.";
  }

  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    msg.includes("requested device not found") ||
    msg.includes("device not found")
  ) {
    return "No camera or microphone found on this device. Connect a webcam, ensure it is not disabled in Windows Settings → Privacy → Camera, or use External URL (YouTube) streaming instead.";
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Camera is busy or unavailable. Close Zoom, Teams, or other apps using the camera, then try again.";
  }

  if (name === "OverconstrainedError") {
    return "This camera does not support the requested settings. Try a different webcam or use External URL streaming.";
  }

  if (name === "SecurityError") {
    return "Camera requires a secure connection. Use http://localhost:5173 for development or HTTPS in production.";
  }

  return err?.message || "Could not start camera. Check browser permissions and connected devices.";
}
