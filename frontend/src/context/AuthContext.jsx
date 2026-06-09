import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import {
  saveAuthSession,
  clearAuthSession,
  getStoredToken,
  loadRememberedEmail,
} from "../utils/authStorage";

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
              user: profile,
              email: profile.email,
              rememberEmail: !!loadRememberedEmail(),
            });
          }
          setUser(profile);
          if (res.data.theme) {
            localStorage.setItem("theme", res.data.theme);
            document.documentElement.classList.toggle("dark", res.data.theme === "dark");
          }
          if (res.data.language) {
            localStorage.setItem("language", res.data.language);
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
    const { token: _token, ...profile } = res.data;
    saveAuthSession({
      token: res.data.token,
      user: profile,
      email,
      rememberEmail,
    });
    setUser(profile);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", { name, email, password });
    const { token: _token, ...profile } = res.data;
    saveAuthSession({
      token: res.data.token,
      user: profile,
      email,
      rememberEmail: true,
    });
    setUser(profile);
    return res.data;
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
