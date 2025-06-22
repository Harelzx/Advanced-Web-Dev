'use client';
import React from 'react';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  isLoginInput = false,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderColor: '#cbd5e1'
      }}
      className={`w-full p-3 mb-4 border rounded-lg outline-none placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
        isLoginInput ? 'text-left placeholder:text-right' : 'text-right'
      } ${className}`}
      dir={isLoginInput ? 'ltr' : 'rtl'}
    />
  );
};

export default Input;