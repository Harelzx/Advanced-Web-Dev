'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex">
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  const hideNavbar = pathname.startsWith('/login') || pathname.startsWith('/FirstQuiz') || pathname.startsWith('/sign-up') || pathname.startsWith('/dashboard');

  return (
        <div className="min-h-screen flex">
          {!hideNavbar && <Navbar />}
          <main className="flex-grow">{children}</main>
        </div>
  );
}
