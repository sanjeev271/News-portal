const AUTH_FILE_KEY = "news_portal_auth.json";
const REMEMBER_EMAIL_KEY = "news_portal_remembered_email";

export function saveAuthSession({ token, refreshToken, user, email, rememberEmail = false }) {
  const payload = {
    token,
    refreshToken,
    user,
    savedAt: Date.now(),
  };
  localStorage.setItem(AUTH_FILE_KEY, JSON.stringify(payload, null, 2));

  if (rememberEmail && email) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } else if (!rememberEmail) {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
}

export function loadAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_FILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadRememberedEmail() {
  return localStorage.getItem(REMEMBER_EMAIL_KEY) || "";
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_FILE_KEY);
  localStorage.removeItem("token");
}

export function getStoredToken() {
  const session = loadAuthSession();
  return session?.token || localStorage.getItem("token");
}

export function getStoredRefreshToken() {
  const session = loadAuthSession();
  return session?.refreshToken || null;
}
