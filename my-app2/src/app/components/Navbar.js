"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-xl z-10 fixed top-0 left-0">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        dir="rtl"
      >
        {/* Title */}
        <div className="text-xl font-bold text-white dark:text-green-100">
          LearnPath
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center justify-between w-full">
          {/* Right-side nav links */}
          <ul className="flex flex-row-reverse space-x-reverse space-x-6 text-gray-800 dark:text-white">
            <li>
              <Link
                href="/Main_Page"
                className="hover:bg-green-100 dark:hover:bg-green-700 rounded px-3 py-2"
              >
                ראשי
              </Link>
            </li>
            <li>
              <Link
                href="/InterStudy?reset=1"
                className="hover:bg-green-100 dark:hover:bg-green-700 rounded px-3 py-2"
              >
                תרגולים
              </Link>
            </li>
            <li>
              <Link
                href="/PersonalizedPath"
                className="hover:bg-green-100 dark:hover:bg-green-700 rounded px-3 py-2"
              >
                מסלול למידה אישי
              </Link>
            </li>
          </ul>

          {/* Left-side logout */}
          <Link
            href="/"
            className="text-green-600 hover:bg-green-100 dark:hover:bg-green-700 rounded px-3 py-2"
          >
            התנתקות
          </Link>
        </div>

        {/* Hamburger button for mobile */}
        <div className="md:hidden flex items-center">
          <button
            className="text-3xl text-gray-700 dark:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul
          className="md:hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col space-y-2 p-4"
          dir="rtl"
        >
          {/* Right-aligned nav links */}
          <li>
            <Link
              href="/Main_Page"
              className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded text-right"
            >
              ראשי
            </Link>
          </li>
          <li>
            <Link
              href="/InterStudy?reset=1"
              className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded text-right"
            >
              תרגולים
            </Link>
          </li>
          <li>
            <Link
              href="/PersonalizedPath"
              className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded text-right"
            >
              מסלול למידה אישי
            </Link>
          </li>
          {/* Left-aligned logout */}
          <li className="self-start">
            <Link
              href="/"
              className="block py-2 px-3 text-green-600 hover:bg-green-100 dark:hover:bg-green-700 rounded text-left"
            >
              התנתקות
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
