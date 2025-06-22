"use client";
import { useTheme } from "./ThemeContext";

export default function ThemeWrapper({ children }) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`} style={{
      backgroundColor: 'var(--background-color)',
      color: 'var(--text-color)'
    }}>
      {children}
    </div>
  );
}