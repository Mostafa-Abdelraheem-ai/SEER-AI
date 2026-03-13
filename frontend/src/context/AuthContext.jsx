import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("seer_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await api.get("/api/auth/me");
      setUser(response.data);
    } catch {
      localStorage.removeItem("seer_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const register = async (payload) => {
    const response = await api.post("/api/auth/register", payload);
    return response.data;
  };

  const login = async ({ email, password }) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    const response = await api.post("/api/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    localStorage.setItem("seer_token", response.data.access_token);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem("seer_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, register, login, logout, refreshUser: loadUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
