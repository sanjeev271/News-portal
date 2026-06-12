import axios from "axios";
import { getStoredToken, getStoredRefreshToken, clearAuthSession, saveAuthSession, loadAuthSession } from "../utils/authStorage";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

let refreshing = null;

API.interceptors.request.use((req) => {
  const token = getStoredToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  if (req.data instanceof FormData) {
    delete req.headers["Content-Type"];
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    const original = error.config;

    if (status === 401 && !original._retry) {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken && !original.url?.includes("/auth/refresh")) {
        original._retry = true;
        try {
          if (!refreshing) {
            refreshing = axios.post(
              `${import.meta.env.VITE_API_URL || "/api"}/auth/refresh`,
              { refreshToken }
            );
          }
          const res = await refreshing;
          refreshing = null;
          const session = loadAuthSession();
          saveAuthSession({
            token: res.data.token,
            refreshToken: res.data.refreshToken,
            user: res.data,
            email: res.data.email,
            rememberEmail: !!session?.user,
          });
          original.headers.Authorization = `Bearer ${res.data.token}`;
          return API(original);
        } catch {
          refreshing = null;
          clearAuthSession();
          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login?session=expired";
          }
        }
      } else {
        clearAuthSession();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?session=expired";
        }
      }
    }

    if (status === 403 && error.response?.data?.message?.includes("admin")) {
      const onAdminPage = window.location.pathname.startsWith("/admin");
      if (onAdminPage) {
        window.location.href = "/?access=denied";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
