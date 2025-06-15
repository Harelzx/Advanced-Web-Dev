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
            <div className={`w-64 panels panels shadow-xl z-10 ${open ? 'block' : 'hidden'} md:block `}>
                <h2 className="text-xl font-bold text-green-600 dark:text-green-100 p-4">LearnPath</h2>
                <ul className="flex flex-col gap-2 p-4 text-gray-800 dark:text-white">
                <li><Link href="/Main_Page" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded text-right">ראשי</Link></li>
                <li><Link href="/InterStudy" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded text-right">תרגולים </Link></li>
                <li><Link href="/PersonalizedPath" className="block py-2 px-3 hover:bg-green-100 dark:hover:bg-green-700 rounded text-right">מסלול למידה אישי</Link></li>              
                <li><Link href="/" className="block py-2 px-3 text-green-600 hover:bg-green-100 dark:hover:bg-green-700 rounded text-right">התנתקות</Link></li>
                </ul>
            </div>

        </>
    )
    
}