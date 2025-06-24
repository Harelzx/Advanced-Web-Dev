'use client';
import Link from 'next/link';

export default function BackArrow({ href = "/", ariaLabel = "חזרה" }) {
  return (
    <Link
      href={href}
      className="absolute right-4 top-4 text-2xl hover:text-indigo-400"
      aria-label={ariaLabel}
    >
      →
    </Link>
  );
} 