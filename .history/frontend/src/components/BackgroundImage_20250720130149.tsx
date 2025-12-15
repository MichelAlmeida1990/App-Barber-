'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface BackgroundImageProps {
  src: string;
  fallbackClass: string;
  children?: React.ReactNode;
}

export function BackgroundImage({ src, fallbackClass, children }: BackgroundImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageLoaded(false);
      setImageError(true);
    };
    img.src = src;
  }, [src]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image ou Fallback */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${fallbackClass} ${
          imageLoaded && !imageError ? 'opacity-100' : 'opacity-50'
        }`}
        style={{
          backgroundImage: imageLoaded && !imageError ? `url(${src})` : undefined,
        }}
      ></div>
      
      {/* Loading indicator */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size="lg" color="yellow" />
              <p className="text-white font-medium">Carregando...</p>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
} 