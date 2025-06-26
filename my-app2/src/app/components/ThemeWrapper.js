"use client";
import { useTheme } from "./ThemeContext";

export default function ThemeWrapper({ children }) {
  const { theme } = useTheme();

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      {children}
    </div>
  );
}