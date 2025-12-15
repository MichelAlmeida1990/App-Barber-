'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function ClientSidebar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-600 rounded animate-pulse"></div>
              <div className="ml-2 h-6 w-32 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center px-2 py-2">
                <div className="h-6 w-6 bg-gray-600 rounded animate-pulse"></div>
                <div className="ml-3 h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-shrink-0 bg-gray-700 p-4">
          <div className="group block w-full flex-shrink-0">
            <div className="flex items-center">
              <div className="h-9 w-9 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="ml-3">
                <div className="h-4 w-16 bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-20 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Sidebar />;
} 