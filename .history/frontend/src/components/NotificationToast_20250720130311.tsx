'use client';

import { useState, useEffect } from 'react';
import { IconFallback } from './IconFallback';

interface NotificationToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function NotificationToast({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: 'check',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/50',
      textColor: 'text-green-300',
      iconColor: 'text-green-400'
    },
    error: {
      icon: 'x',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/50',
      textColor: 'text-red-300',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: 'warning',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-400/50',
      textColor: 'text-yellow-300',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: 'info',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/50',
      textColor: 'text-blue-300',
      iconColor: 'text-blue-400'
    }
  };

  const config = typeConfig[type];

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <div className={`${config.bgColor} ${config.borderColor} ${config.textColor} backdrop-blur-md border rounded-xl p-4 shadow-lg max-w-sm`}>
        <div className="flex items-center space-x-3">
          <div className={`${config.iconColor} text-lg`}>
            {type === 'success' && '✅'}
            {type === 'error' && '❌'}
            {type === 'warning' && '⚠️'}
            {type === 'info' && 'ℹ️'}
          </div>
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="ml-auto text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 