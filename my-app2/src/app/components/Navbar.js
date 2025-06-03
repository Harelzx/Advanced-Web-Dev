"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 text-3xl text-gray-700 md:hidden"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* Navbar for larger screens */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-green-600 mb-8">LearnPath</h2>
          <nav>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/Main_Page"
                  className="block py-2 px-4 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors duration-200"
                >
                  דף הבית
                </Link>
              </li>
              <li>
                <Link
                  href="/InterStudy"
                  className="block py-2 px-4 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors duration-200"
                >
                  מרכז תרגול
                </Link>
              </li>
              <li>
                <Link
                  href="/PersonalizedPath"
                  className="block py-2 px-4 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors duration-200"
                >
                  מסלול אישי
                </Link>
              </li>
              <li>
                <Link
                  href="/FirstQuiz"
                  className="block py-2 px-4 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors duration-200"
                >
                  אבחון
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="block py-2 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
                  onClick={() => {
                    sessionStorage.removeItem("user");
                  }}
                >
                  התנתק
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
