'use client';
import {useState} from 'react';
import Link from 'next/link';

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
  className={`w-64 bg-white dark:bg-gray-900 shadow-xl z-10 
              ${open ? 'block' : 'hidden'} md:block`}
            >

                <h2 className="text-xl font-bold text-green-600 dark:text-green-100 p-4">LearnPath</h2>
                <ul className="flex flex-col gap-2 p-4 text-gray-800 dark:text-white">
                <li><Link href="/Main_Page" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-indigo-700 rounded">Home</Link></li>
                <li><Link href="/InterStudy" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded">Recovery Hub</Link></li>
                <li><Link href="/PersonalizedPath" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded">Custom Plan</Link></li>
                <li><Link href="/FirstQuiz" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded">Assessment</Link></li>
                <li><Link href="/" className="block py-2 px-3 text-green-600 hover:bg-green-100 dark:hover:bg-green-700 rounded">Log Out</Link></li>
                </ul>
            </div>

        </>
    )
    
}