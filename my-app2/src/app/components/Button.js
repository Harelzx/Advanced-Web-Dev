'use client';
import React from 'react';

const Button = ({
  onClick,
  type = 'button',
  children,
  disabled,
  loading,
  className = 'w-auto'
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`group relative flex justify-center items-center px-5 py-2.5 text-base font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
      disabled={disabled || loading}
    >
      {children}
    </button>
  );
};

export default Button;