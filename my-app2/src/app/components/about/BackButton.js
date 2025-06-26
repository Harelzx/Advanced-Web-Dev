/**
 * Back Button Component
 * Flexible navigation button that can work as full button or minimal arrow
 * Can be customized with different destinations, text, and positioning
 */

import Link from 'next/link';

export default function BackButton({ 
  href = "/", 
  text = "← חזרה לעמוד הראשי",
  className = "",
  variant = "full", // "full" or "arrow"
  ariaLabel = "חזרה"
}) {
  // Arrow variant (like BackArrow)
  if (variant === "arrow") {
    return (
      <Link
        href={href}
        className={`absolute right-4 top-4 text-2xl hover:text-indigo-400 transition-colors duration-200 ${className}`}
        aria-label={ariaLabel}
      >
        →
      </Link>
    );
  }

  // Full button variant (default)
  return (
    <div className="p-4">
      <Link 
        href={href}
        className={`inline-flex items-center gap-2 transition-colors duration-200 font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 ${className}`}
        aria-label={ariaLabel}
      >
        {text}
      </Link>
    </div>
  );
} 