import "./globals.css";
import Link from "next/link";
import Navbar from "./components/Navbar";
import AppShell from "./components/AppShell";

export const metadata = {
  title: "Math Quiz App",
  description: "Interactive math quiz application for students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
