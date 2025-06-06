'use client';

import "./globals.css";
import AppShell from './components/AppShell';
import { usePathname } from 'next/navigation';
import ChatbotSidebar from './components/ChatbotSidebar';


export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  //list of pages where we don't want to show the chatbot
  const pagesWithoutChat = ['/', '/sign-up', '/login'];
  const shouldShowChat = !pagesWithoutChat.includes(pathname);

  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <AppShell>{children}</AppShell>
        {shouldShowChat && <ChatbotSidebar />}
      </body>
    </html>
  );
}