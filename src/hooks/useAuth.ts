"use client";

import { useState } from "react";

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  channelName: string;
  channelDescription?: string;
  avatarUrl?: string;
  currency: string;
  theme: string;
  role: string;
}

const DEMO_USER: User = {
  id: 1,
  username: "admin",
  displayName: "Studio Admin",
  email: "admin@creatorstudio.demo",
  channelName: "Creator Studio Demo",
  currency: "INR",
  theme: "dark",
  role: "admin",
};

export function useAuth() {
  const [state] = useState({ user: DEMO_USER, loading: false, error: null as string | null });

  const login = async () => ({ success: true });
  const logout = async () => {
    // Login is intentionally disabled in demo mode.
  };
  const refresh = async () => {};

  return { ...state, login, logout, refresh };
}
