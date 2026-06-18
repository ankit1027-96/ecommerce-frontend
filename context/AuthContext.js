"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { setAccessToken } from "@/lib/api";

const AuthContext = createContext(null);

async function attemptSilentRefresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      },
    );
    const data = await res.json();

    if (data.success) {
      setAccessToken(data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data.user;
    }

    localStorage.removeItem("refreshToken");
    return null;
  } catch (err) {
    localStorage.removeItem("refreshToken");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Guard against running twice in React strict mode
    if (initialized.current) return;
    initialized.current = true;

    // attemptSilentRefresh is defined outside — no setState inside effect
    // We use .then() instead of await to keep the effect callback synchronous
    attemptSilentRefresh().then((userData) => {
      setUser(userData);
      setLoading(false);
    });
  }, []);

  function login(userData, accessToken, refreshToken) {
    setUser(userData);
    setAccessToken(accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("refreshToken");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
