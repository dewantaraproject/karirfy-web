import React, { createContext, useContext, useEffect, useState } from "react";
import type { ThemeMode } from "../types";
import { KIPRAH_STORAGE_KEYS } from "../lib/sessionCleanup";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  isPrivacyMode: false,
  togglePrivacyMode: () => {},
});

const PRIVACY_KEY = "karirfy_web_privacy_mode";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem(KIPRAH_STORAGE_KEYS.theme);
    return saved === "light" ? "light" : "dark";
  });

  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(PRIVACY_KEY) === "true";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KIPRAH_STORAGE_KEYS.theme, theme);
    } catch {
      // ignore storage failure
    }
  }, [theme]);

  const setTheme = (next: ThemeMode) => setThemeState(next);
  const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  const togglePrivacyMode = () =>
    setIsPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PRIVACY_KEY, next ? "true" : "false");
      } catch {
        // ignore storage failure
      }
      return next;
    });

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, isPrivacyMode, togglePrivacyMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
