// src/contexts/ToastContext.js
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ToastContainer } from '../components/UI/Toast';

const ToastContext = createContext();

export function ToastProvider({ children, position = 'top-right', maxToasts = 5 }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastConfig) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      ...toastConfig,
      onClose: (toastId) => removeToast(toastId)
    };

    setToasts(prev => {
      const newToasts = [toast, ...prev];
      // Limit number of toasts
      return newToasts.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const toast = useMemo(() => ({
    success: (title, message, options = {}) => addToast({
      type: 'success',
      title,
      message,
      ...options
    }),
    error: (title, message, options = {}) => addToast({
      type: 'error',
      title,
      message,
      duration: 7000, // Errors stay longer
      ...options
    }),
    warning: (title, message, options = {}) => addToast({
      type: 'warning',
      title,
      message,
      ...options
    }),
    info: (title, message, options = {}) => addToast({
      type: 'info',
      title,
      message,
      ...options
    }),
    promise: async (promise, messages) => {
      const loadingId = addToast({
        type: 'info',
        title: messages.loading || 'Loading...',
        duration: 0 // Don't auto-dismiss loading toast
      });

      try {
        const result = await promise;
        removeToast(loadingId);
        addToast({
          type: 'success',
          title: messages.success || 'Success!',
          message: typeof messages.success === 'function' 
            ? messages.success(result) 
            : messages.successMessage
        });
        return result;
      } catch (error) {
        removeToast(loadingId);
        addToast({
          type: 'error',
          title: messages.error || 'Error occurred',
          message: typeof messages.error === 'function'
            ? messages.error(error)
            : error.message || 'An unexpected error occurred',
          duration: 7000
        });
        throw error;
      }
    }
  }), [addToast, removeToast]);

  const value = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    toast
  }), [toasts, addToast, removeToast, clearAllToasts, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;