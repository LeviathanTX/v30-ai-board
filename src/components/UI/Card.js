// src/components/UI/Card.js
import React, { memo } from 'react';

const Card = memo(({
  children,
  className = '',
  hover = false,
  padding = 'lg',
  shadow = 'md',
  border = true,
  gradient = false,
  onClick,
  ...props
}) => {
  const baseStyles = `
    bg-white rounded-2xl transition-all duration-200
    ${onClick ? 'cursor-pointer' : ''}
    ${hover ? 'hover:scale-[1.02] hover:-translate-y-1' : ''}
  `;

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm hover:shadow-md',
    md: 'shadow-lg hover:shadow-xl',
    lg: 'shadow-xl hover:shadow-2xl',
    xl: 'shadow-2xl hover:shadow-3xl'
  };

  const borderStyles = border ? 'border border-gray-100 hover:border-gray-200' : '';

  const gradientStyles = gradient 
    ? 'bg-gradient-to-br from-white via-blue-50 to-purple-50' 
    : 'bg-white';

  return (
    <div
      className={`
        ${baseStyles}
        ${paddingStyles[padding]}
        ${shadowStyles[shadow]}
        ${borderStyles}
        ${gradient ? gradientStyles : 'bg-white'}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;