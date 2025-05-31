// src/app/components/AppShell.jsx
'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function AppShell({ children }) {
  const pathname = usePathname();


  const hideNavbar = pathname.startsWith('/login') || pathname.startsWith('/sign-up');

  return (
    <div className="min-h-screen flex">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow min-h-screen">{children}</main>
    </div>
  );
}
