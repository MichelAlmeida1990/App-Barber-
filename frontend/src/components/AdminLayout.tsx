'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import AdminProtectedPage from './AdminProtectedPage';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    router.push('/');
  };

  return (
    <AdminProtectedPage>
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="flex h-screen">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>

        {/* Static sidebar for desktop - altura total */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-56 lg:flex-col lg:h-screen">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-56">
          <div className="lg:hidden">
            <div className="flex items-center justify-between bg-gradient-to-r from-black to-gray-800 border-b-2 border-yellow-500 px-4 py-3 sm:px-6">
              <div>
                <h1 className="text-lg font-bold text-yellow-400">BARBEARIA DO DUDÃO</h1>
                <p className="text-xs text-red-400">ADMIN PANEL</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                  title="Sair e voltar para página inicial"
                >
                  Sair
                </button>
                <button
                  type="button"
                  className="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md text-yellow-400 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-x-auto bg-white">
            <div className="py-6 min-w-0">
              <div className="px-4 sm:px-6 lg:px-8 max-w-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    </AdminProtectedPage>
  );
} 