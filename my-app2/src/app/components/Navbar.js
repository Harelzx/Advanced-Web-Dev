'use client';
import {useState} from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile header bar */}
            <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                    className="text-2xl text-gray-700 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
                    onClick={() => setOpen(!open)}
                    >
                    ☰
                    </button>
                    <h1 className="text-lg font-semibold text-green-600">LearnPath</h1>
                </div>
            </div>

            {/* Navbar for larger screens */}
            <div   
  className={`w-64 h-screen bg-white dark:bg-gray-900 shadow-xl z-40 
              md:fixed md:left-0 md:top-0 md:block
              ${open ? 'fixed left-0 top-0' : 'hidden'}`}
            >

                <div className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-bold text-green-600 dark:text-green-100">LearnPath</h2>
                    <button 
                        className="md:hidden text-2xl text-gray-600 hover:text-gray-800"
                        onClick={() => setOpen(false)}
                    >
                        ✕
                    </button>
                </div>
                <ul className="flex flex-col gap-2 p-4 text-gray-800 dark:text-white">
                <li><Link href="/Main_Page" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-indigo-700 rounded" onClick={() => setOpen(false)}>Home</Link></li>
                <li><Link href="/InterStudy" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded" onClick={() => setOpen(false)}>Recovery Hub</Link></li>
                <li><Link href="/PersonalizedPath" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded" onClick={() => setOpen(false)}>Custom Plan</Link></li>
                <li><Link href="/" className="block py-2 px-3 text-green-600 hover:bg-green-100 dark:hover:bg-green-700 rounded" onClick={() => setOpen(false)}>Log Out</Link></li>
                </ul>
            </div>

        </>
    )
    
}