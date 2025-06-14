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
      className={`w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500 ${
        isLoginInput ? 'placeholder:text-right ltr text-left' : 'text-right'
      } ${className}`}
    />
  );
};

export default Input;