// src/components/UI/Button.js
import React, { forwardRef, memo } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 text-white 
      hover:from-blue-700 hover:to-purple-700 
      focus:ring-blue-500 shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-white text-gray-700 border border-gray-300
      hover:bg-gray-50 hover:border-gray-400
      focus:ring-gray-500 shadow-sm hover:shadow-md
    `,
    success: `
      bg-gradient-to-r from-green-600 to-emerald-600 text-white
      hover:from-green-700 hover:to-emerald-700
      focus:ring-green-500 shadow-lg hover:shadow-xl
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-pink-600 text-white
      hover:from-red-700 hover:to-pink-700
      focus:ring-red-500 shadow-lg hover:shadow-xl
    `,
    ghost: `
      text-gray-600 hover:text-gray-900 hover:bg-gray-100
      focus:ring-gray-500
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 bg-transparent
      hover:bg-blue-600 hover:text-white
      focus:ring-blue-500
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    xl: 'px-8 py-4 text-lg rounded-2xl'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4 mr-2" />
      ) : null}
      
      {children}
      
      {!loading && RightIcon && (
        <RightIcon className="w-4 h-4 ml-2" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default memo(Button);