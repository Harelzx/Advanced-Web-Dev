'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ 
    isDashboard = false, 
    userRole = null, 
    userName = null,
    onOpenChat = null,
    onAddStudent = null,
    onAddChild = null,
    unreadCount = 0
}) {
    const [open, setOpen] = useState(false);

    return (
        <nav className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-slate-700/50 z-10 fixed top-0 left-0">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16" dir="rtl">
                {/* Title */}
                <h2 className="navbar-title text-xl font-bold text-white drop-shadow-md">
                    {isDashboard ? (userRole === 'teacher' ? 'לוח בקרה למורה' : 'לוח בקרה להורה') : 'LearnPath'}
                </h2>

                {/* Desktop menu */}
                <div className="hidden md:flex items-center justify-between w-full">
                    {isDashboard ? (
                        /* Dashboard actions */
                        <div className="flex items-center gap-4">
                            <span className="navbar-greeting font-medium">
                                ברוך שובך, {userName}!
                            </span>
                            
                            {/* Chat Button */}
                            <button
                                onClick={onOpenChat}
                                className="navbar-button relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-4 py-2 transition-all duration-200 font-medium"
                            >
                                <span>צ&apos;אט</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            {/* Add Button */}
                            <button
                                onClick={userRole === 'teacher' ? onAddStudent : onAddChild}
                                className="navbar-button hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-4 py-2 transition-all duration-200 font-medium"
                            >
                                <span>הוסף {userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}</span>
                            </button>
                        </div>
                    ) : (
                        /* Regular nav links */
                        <ul className="flex flex-row-reverse space-x-reverse text-slate-700 dark:text-slate-200">
                            <li>
                                <Link href="/InterStudy" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-4 py-2 transition-all duration-200 font-medium">
                                    תרגולים
                                </Link>
                            </li>
                            <li>
                                <Link href="/PersonalizedPath" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-4 py-2 transition-all duration-200 font-medium">
                                    מסלול למידה אישי
                                </Link>
                            </li>
                            <li>
                                <Link href="/Main_Page" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-4 py-2 transition-all duration-200 font-medium">
                                    ראשי
                                </Link>
                            </li>
                        </ul>
                    )}

                    {/* Left-side logout */}
                    <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-4 py-2 transition-all duration-200 font-medium">
                        התנתקות
                    </Link>
                </div>

                {/* Hamburger button for mobile */}
                <div className="md:hidden flex items-center">
                    <button
                        className="text-2xl text-white px-2 py-1 hover:bg-white/20 rounded transition-colors duration-200"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <ul className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-800 dark:text-slate-100 flex flex-col space-y-1 p-4 border-t border-slate-200/30 dark:border-slate-700/30" dir="rtl">
                    {isDashboard ? (
                        /* Dashboard mobile menu */
                        <>
                            <li className="mobile-dashboard-greeting py-3 px-4 text-center font-medium text-slate-800 dark:text-slate-200">
                                ברוך שובך, {userName}!
                            </li>
                            
                            {/* Chat Button */}
                            <li>
                                <button
                                    onClick={() => { onOpenChat(); setOpen(false); }}
                                    className="mobile-dashboard-button w-full relative py-3 px-4 hover:bg-white/20 rounded-lg text-right transition-all duration-200 font-medium text-lg"
                                >
                                    <span>צ&apos;אט</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                            </li>
                            
                            {/* Add Student/Child Button */}
                            <li>
                                <button
                                    onClick={() => { (userRole === 'teacher' ? onAddStudent : onAddChild)(); setOpen(false); }}
                                    className="mobile-dashboard-button w-full py-3 px-4 hover:bg-white/20 rounded-lg text-right transition-all duration-200 font-medium text-lg"
                                >
                                    <span>הוסף {userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}</span>
                                </button>
                            </li>
                        </>
                    ) : (
                        /* Regular nav links */
                        <>
                            <li>
                                <Link href="/Main_Page" className="block py-3 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-right transition-all duration-200 font-medium" onClick={() => setOpen(false)}>
                                    ראשי
                                </Link>
                            </li>
                            <li>
                                <Link href="/PersonalizedPath" className="block py-3 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-right transition-all duration-200 font-medium" onClick={() => setOpen(false)}>
                                    מסלול למידה אישי
                                </Link>
                            </li>
                            <li>
                                <Link href="/InterStudy" className="block py-3 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-right transition-all duration-200 font-medium" onClick={() => setOpen(false)}>
                                    תרגולים
                                </Link>
                            </li>
                        </>
                    )}
                    
                    {/* Left-aligned logout */}
                    <li className="mt-3 border-t border-slate-200/30 dark:border-slate-700/30 pt-3">
                        <Link href="/" className="block py-3 px-4 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-right font-medium transition-all duration-200" onClick={() => setOpen(false)}>
                            התנתקות
                        </Link>
                    </li>
                </ul>
            )}
        </nav>
    );
}
