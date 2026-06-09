import axios from "axios";
import { getStoredToken, clearAuthSession } from "../utils/authStorage";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

API.interceptors.request.use((req) => {
  const token = getStoredToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }  if (req.data instanceof FormData) {
    delete req.headers["Content-Type"];
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearAuthSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?session=expired";
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
