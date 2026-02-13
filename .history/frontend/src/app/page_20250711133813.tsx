'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScissorsIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o admin após um breve delay para mostrar a mensagem
    const timer = setTimeout(() => {
      router.push('/admin');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <ScissorsIcon className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Admin Barbearia
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Sistema de gestão completo para barbearias
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-white mb-4">Redirecionando para o painel administrativo...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
          
          <button
            onClick={handleGoToAdmin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Ir para Admin Panel
          </button>
        </div>

        <div className="text-center text-xs text-gray-400">
          <p>Backend: FastAPI + SQLAlchemy</p>
          <p>Frontend: Next.js + TailwindCSS</p>
        </div>
      </div>
    </div>
  );
}
