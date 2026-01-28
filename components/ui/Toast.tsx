'use client';

import { useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  variant: ToastVariant;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, variant, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variantStyles = {
    success: 'bg-green-600 border-green-600 text-white',
    error: 'bg-red-600 border-red-600 text-white',
    info: 'bg-blue-600 border-blue-600 text-white',
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        px-4 py-3 rounded-lg border
        shadow-lg backdrop-blur-sm
        animate-in slide-in-from-bottom-5 fade-in
        ${variantStyles[variant]}
      `}
      role="alert"
    >
      <div className="flex items-center gap-2">
        {variant === 'success' && <span>✓</span>}
        {variant === 'error' && <span>✕</span>}
        {variant === 'info' && <span>i</span>}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
