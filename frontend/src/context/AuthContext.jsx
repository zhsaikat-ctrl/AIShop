// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // ✅ Load user from localStorage (DO NOT clear cart here)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aishop_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) setUser(parsed);
      }
    } catch (e) {
      console.log("Auth parse error:", e);
      localStorage.removeItem("aishop_user");
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  // ✅ Persist user
  useEffect(() => {
    if (user) localStorage.setItem("aishop_user", JSON.stringify(user));
    else localStorage.removeItem("aishop_user");
  }, [user]);

  // ✅ Login (password based - optional keep)
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    setUser(data);
    return data;
  };

  // ✅ Register (password based - optional keep)
  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Register failed");

    setUser(data);
    return data;
  };

  /* ======================================================
     ✅ OTP LOGIN (passwordless)
     POST /api/auth/request-otp
     POST /api/auth/verify-otp
  ====================================================== */

  const requestOtp = async (email, name = "") => {
    const res = await fetch(`${API_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "OTP send failed");
    return data; // { message: "OTP sent" }
  };

  const verifyOtp = async (email, otp) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "OTP verify failed");

    setUser(data);
    localStorage.setItem("aishop_user", JSON.stringify(data));
    return data;
  };

  // ✅ Logout (IMPORTANT: do NOT clear all localStorage)
  const logout = () => {
    setUser(null);
    localStorage.removeItem("aishop_user"); // cart untouched
  };

  const value = {
    user,
    setUser,
    token: user?.token || null, // ✅ handy
    login,
    register,
    requestOtp,
    verifyOtp,
    logout,
    loadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
