import "./globals.css";
import React from 'react';
import Link from 'next/link';


export const metadata = {
  title: "Student Study Platform",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
          <div className="p-4 border border-blue-600 justify-start gap-4">
              <Link href={"/Main_Page"}>Home</Link>
              <Link href={"/InterStudy"} className="p-2">Interactive Study</Link>
              <Link href={"/PersonalizedPath"} className="p-2">Personalized Learning Path</Link>
              <Link href={"/"} className="p-2">Log Out</Link>
          </div>
          <div className="grow">{children}</div>
          <div className="p-4 border border-blue-600">All rights reserved to G6 from Braude.</div>
      </body>
    </html>
  );
}


