// src/components/CoreShell/ModuleContainer.js
import React, { useState } from 'react';
import { Maximize2, Minimize2, MoreVertical } from 'lucide-react';

export default function ModuleContainer({ 
  children, 
  className = '',
  title = '',
  icon: Icon,
  color = 'blue',
  allowExpand = true,
  onExpand,
  onCollapse,
  actions = []
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleToggleExpand = () => {
    if (isExpanded) {
      setIsExpanded(false);
      if (onCollapse) onCollapse();
    } else {
      setIsExpanded(true);
      if (onExpand) onExpand();
    }
  };

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
  };

  return (
    <div className={`
      h-full overflow-hidden flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm
      transition-all duration-300 ease-in-out
      ${isExpanded ? 'fixed inset-4 z-40' : 'relative'}
      ${className}
    `}>
      {/* Module Header */}
      {(title || allowExpand) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${colorClasses[color] || colorClasses.blue}
              `}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            {title && (
              <h3 className="font-semibold text-gray-900">{title}</h3>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Action Menu */}
            {actions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {showActions && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowActions(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      {actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            action.onClick();
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          {action.icon && <action.icon className="w-4 h-4" />}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Expand/Collapse Button */}
            {allowExpand && (
              <button
                onClick={handleToggleExpand}
                className={`
                  px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200
                  flex items-center space-x-2
                  ${isExpanded 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                  }
                `}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Minimize</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Module Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Expanded Overlay Background */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 -z-10"
          onClick={handleToggleExpand}
        />
      )}
    </div>
  );
}