'use client';

import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChatbotSidebar from './components/ChatbotSidebar';


export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  //list of pages where we don't want to show the chatbot
  const pagesWithoutChat = ['/', '/sign-up'];
  const shouldShowChat = !pagesWithoutChat.includes(pathname);
  
  //list of pages where we don't want to show the navigation
  const pagesWithoutNavigation = ['/', '/sign-up'];
  const shouldShowNavigation = !pagesWithoutNavigation.includes(pathname);

  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        {shouldShowNavigation && (
          <div className="p-4 border border-black-600 flex justify-between items-center">
            <div className="flex justify-start gap-6">
              <Link href="/Main_Page" className="p-2">Home</Link>
              <Link href="/InterStudy" className="p-2">Learning Recovery Hub</Link>
              <Link href="/PersonalizedPath" className="p-2">Custom Recovery Plan</Link>
              <Link href="/FirstQuiz" className="p-2">Initial Gap Assessment</Link>
            </div>
            <Link href="/" className="p-2">Log Out</Link>
          </div>
        )}
        <div className="grow">{children}</div>
        {shouldShowChat && <ChatbotSidebar />}
      </body>
    </html>
  );
}