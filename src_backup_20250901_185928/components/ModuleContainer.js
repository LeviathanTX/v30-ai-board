// src/components/ModuleContainer.js
import React from 'react';

export default function ModuleContainer({ children, className = '' }) {
  return (
    <div className={`h-full overflow-hidden flex flex-col ${className}`}>
      {children}
    </div>
  );
}