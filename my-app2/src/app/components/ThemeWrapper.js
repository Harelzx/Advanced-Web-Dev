"use client";
import { useTheme } from "./ThemeContext";

export default function ThemeWrapper({ children }) {
  const { theme } = useTheme();
  const bgColorClass = theme === "light" ? "bg-bdb4c0" : "bg-gray-900";
  const textColorClass = theme === "light" ? "text-black" : "text-white";

  return (
    <div className={`${bgColorClass} ${textColorClass} min-h-screen`}>
      {children}
    </div>
  );
}