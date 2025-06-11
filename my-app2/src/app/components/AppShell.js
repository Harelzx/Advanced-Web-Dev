'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import ChatbotSidebar from './chatbot/ChatbotSidebar';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Pages where the Navbar and Chatbot should be hidden
  const hideOnPages = ['/login', '/FirstQuiz', '/sign-up', '/dashboard', '/ForgotPassword'];
  const shouldHideUI = hideOnPages.some(p => pathname.startsWith(p));

  return (
        <div className="min-h-screen flex">
          {!shouldHideUI && <Navbar />}
          <main className="flex-grow">{children}</main>
          {!shouldHideUI && <ChatbotSidebar />}
        </div>
  );
}
