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
      className={`group relative flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled || loading}
    >
      {children}
    </button>
  );
};

export default Button;