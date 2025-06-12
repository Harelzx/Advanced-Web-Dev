"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingWheel from "@/app/components/LoadingWheel";

export default function HomeRedirect() {
  const router = useRouter(); 

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 0); 
    return () => clearTimeout(timer);
  }, [router]); 

  return (
    <LoadingWheel
      title="מעביר..."
      message="ממתין לעמוד הכניסה"
    />
  );
}