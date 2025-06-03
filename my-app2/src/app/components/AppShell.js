"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hideNavbar =
    pathname === "/login" || pathname === "/sign-up" || pathname === "/";

  return (
    <div className="min-h-screen flex">
      {!hideNavbar && <Navbar />}
      <main className={`flex-grow ${!hideNavbar ? "md:ml-64" : ""}`}>
        {children}
      </main>
    </div>
  );
}
