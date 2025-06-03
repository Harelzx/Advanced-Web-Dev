"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem("user");
    if (isLoggedIn) {
      router.push("/Main_Page");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">⚡</div>
        <p className="text-xl text-gray-600">טוען...</p>
      </div>
    </div>
  );
}
