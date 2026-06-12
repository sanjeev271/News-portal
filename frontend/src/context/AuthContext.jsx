import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import i18n from "../i18n";
import {
  saveAuthSession,
  clearAuthSession,
  getStoredToken,
  getStoredRefreshToken,
  loadRememberedEmail,
} from "../utils/authStorage";
import socket from "../socket/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      API.get("/auth/profile")
        .then((res) => {
          const { token: freshToken, ...profile } = res.data;
          if (freshToken) {
            saveAuthSession({
              token: freshToken,
              refreshToken: getStoredRefreshToken(),
              user: profile,
              email: profile.email,
              rememberEmail: !!loadRememberedEmail(),
            });
          }
          setUser(profile);
          socket.emit("join_user_room", { userId: profile._id });
          if (res.data.theme) {
            localStorage.setItem("theme", res.data.theme);
            document.documentElement.classList.toggle("dark", res.data.theme === "dark");
          }
          if (res.data.language) {
            const lang = res.data.language === "hi" ? "en" : res.data.language;
            if (lang === "en" || lang === "ne") {
              localStorage.setItem("language", lang);
              i18n.changeLanguage(lang);
            }
          }
        })
        .catch(() => {
          clearAuthSession();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, rememberEmail = false) => {
    const res = await API.post("/auth/login", { email, password });
    saveAuthSession({
      token: res.data.token,
      refreshToken: res.data.refreshToken,
      user: res.data,
      email,
      rememberEmail,
    });
    setUser(res.data);
    socket.emit("join_user_room", { userId: res.data._id });
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", { name, email, password });
    saveAuthSession({
      token: res.data.token,
      refreshToken: res.data.refreshToken,
      user: res.data,
      email,
      rememberEmail: true,
    });
    setUser(res.data);
    socket.emit("join_user_room", { userId: res.data._id });
    return res.data;
  };

  const logout = async () => {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      await API.post("/auth/logout", { refreshToken }).catch(() => {});
    }
    clearAuthSession();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isReporter = user?.role === "reporter";
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isReporter, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
