'use client';

import { useState, useEffect } from 'react';

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
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${fallbackClass} ${
          imageLoaded && !imageError ? 'bg-image-loading' : ''
        }`}
        style={{
          backgroundImage: imageLoaded && !imageError ? `url(${src})` : undefined,
        }}
      ></div>
      
      {/* Loading indicator */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-lg p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
} 