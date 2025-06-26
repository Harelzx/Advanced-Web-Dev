"use client";
import { useState } from "react";
import Link from "next/link";

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
        <nav className="navbar-custom w-full backdrop-blur-md shadow-lg border-b z-10 fixed top-0 left-0">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16" dir="rtl">
                {/* Title */}
                <h2 className="navbar-title-custom text-xl font-bold drop-shadow-md">
                    {isDashboard ? (userRole === 'teacher' ? 'לוח בקרה למורה' : 'לוח בקרה להורה') : 'LearnPath'}
                </h2>

                {/* Desktop menu */}
                <div className="hidden md:flex items-center justify-between w-full">
                    {isDashboard ? (
                        /* Dashboard actions */
                        <div className="flex items-center gap-4">
                            <span className="navbar-text-custom">
                                ברוך שובך, {userName}!
                            </span>
                            
                            {/* Chat Button */}
                            <button
                                onClick={onOpenChat}
                                className="navbar-button-custom relative rounded-lg px-4 py-2 transition-all duration-200 font-medium"
                            >
                                צ&apos;אט
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            {/* Add Button */}
                            <button
                                onClick={userRole === 'teacher' ? onAddStudent : onAddChild}
                                className="navbar-button-custom rounded-lg px-4 py-2 transition-all duration-200 font-medium"
                            >
                                הוסף {userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}
                            </button>
                        </div>
                    ) : (
                        /* Regular nav links */
                        <ul className="navbar-text-custom flex flex-row-reverse space-x-reverse">
                            <li>
                                <Link href="/InterStudy?reset=1" className="navbar-button-custom rounded-lg px-4 py-2 transition-all duration-200 font-medium">
                                    תרגולים
                                </Link>
                            </li>
                            <li>
                                <Link href="/PersonalizedPath" className="navbar-button-custom rounded-lg px-4 py-2 transition-all duration-200 font-medium">
                                    מסלול למידה אישי
                                </Link>
                            </li>
                            <li>
                                <Link href="/Main_Page" className="navbar-button-custom rounded-lg px-4 py-2 transition-all duration-200 font-medium">
                                    ראשי
                                </Link>
                            </li>
                        </ul>
                    )}

                    {/* Left-side logout */}
                    <Link href="/" className="navbar-button-custom rounded-lg px-4 py-2 transition-all duration-200 font-medium">
                        התנתקות
                    </Link>
                </div>

                {/* Hamburger button for mobile */}
                <div className="md:hidden flex items-center">
                    <button
                        className="navbar-hamburger-custom text-2xl px-2 py-1 hover:bg-slate-200/20 rounded transition-colors duration-200"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <ul className="navbar-custom navbar-text-custom md:hidden backdrop-blur-md flex flex-col space-y-1 p-4 border-t" dir="rtl">
                    {isDashboard ? (
                        /* Dashboard mobile menu */
                        <>
                            <li className="navbar-text-custom py-3 px-4 text-center font-medium">
                                ברוך שובך, {userName}!
                            </li>
                            
                            {/* Chat Button */}
                            <li>
                                <button
                                    onClick={() => { onOpenChat(); setOpen(false); }}
                                    className="navbar-button-custom w-full relative py-3 px-4 rounded-lg text-right transition-all duration-200 font-medium text-lg"
                                >
                                    צ&apos;אט
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
                                    className="navbar-button-custom w-full py-3 px-4 rounded-lg text-right transition-all duration-200 font-medium text-lg"
                                >
                                    הוסף {userRole === 'teacher' ? 'תלמיד/ה' : 'ילד/ה'}
                                </button>
                            </li>
                        </>
                    ) : (
                        /* Regular nav links */
                        <>
                            <li>
                                <Link href="/Main_Page" className="navbar-button-custom block py-3 px-4 rounded-lg text-right transition-all duration-200 font-medium" onClick={() => setOpen(false)}>
                                    ראשי
                                </Link>
                            </li>
                            <li>
                                <Link href="/PersonalizedPath" className="navbar-button-custom block py-3 px-4 rounded-lg text-right transition-all duration-200 font-medium" onClick={() => setOpen(false)}>
                                    מסלול למידה אישי
                                </Link>
                            </li>
                            <li>
                                <Link href="/InterStudy?reset=1" className="navbar-button-custom block py-3 px-4 rounded-lg text-right transition-all duration-200 font-medium" onClick={() => setOpen(false)}>
                                    תרגולים
                                </Link>
                            </li>
                        </>
                    )}
                    
                    {/* Left-aligned logout */}
                    <li className="mt-3 border-t pt-3" style={{ borderTopColor: 'var(--navbar-border)' }}>
                        <Link href="/" className="block py-3 px-4 navbar-button-custom rounded-lg text-right font-medium transition-all duration-200" onClick={() => setOpen(false)}>
                            התנתקות
                        </Link>
                    </li>
                </ul>
            )}
        </nav>
    );
}
