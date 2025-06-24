'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import ChatbotSidebar from './chatbot/ChatbotSidebar';
import FloatingThemeToggle from './ThemeToggle';
import Footer from './Footer';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Pages where the Navbar and Chatbot should be hidden
  const hideOnPages = ['/login', '/FirstQuiz', '/sign-up', '/dashboard', '/ForgotPassword', '/about', '/'];
  const shouldHideUI = hideOnPages.some(p => pathname === p);
  
  // Pages where Footer should be hidden
  const hideFooterOnPages = ['/dashboard', '/PersonalizedPath', '/InterStudy'];
  const shouldHideFooter = hideFooterOnPages.some(p => pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideUI && <Navbar />}
      <div className="flex flex-1">
        <main className="flex-grow">{children}</main>
        {!shouldHideUI && <ChatbotSidebar />}
      </div>
      {!shouldHideFooter && <Footer />}
      <FloatingThemeToggle />
    </div>
  );
}