'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IconFallback from '@/components/IconFallback';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <IconFallback type="scissors" size="lg" className="animate-pulse text-4xl" />
        </div>
        <div className="absolute top-20 right-20">
          <IconFallback type="razor" size="lg" className="animate-pulse delay-1000 text-4xl" />
        </div>
        <div className="absolute bottom-20 left-20">
          <IconFallback type="comb" size="lg" className="animate-pulse delay-2000 text-4xl" />
        </div>
        <div className="absolute bottom-10 right-10">
          <IconFallback type="hair-clipper" size="lg" className="animate-pulse delay-500 text-4xl" />
        </div>
        <div className="absolute top-1/2 left-5">
          <IconFallback type="barber-chair" size="lg" className="animate-pulse delay-1500 text-4xl" />
        </div>
        <div className="absolute top-1/3 right-5">
          <IconFallback type="barber-pole" size="lg" className="animate-pulse delay-700 text-6xl" />
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 p-8 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl border-2 border-yellow-500 shadow-2xl">
        <div className="text-center">
          {/* Logo principal */}
          <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-yellow-500 to-red-600 rounded-full">
            <IconFallback type="logo" size="lg" className="text-6xl" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-2 tracking-wider">
            💈 ELITE BARBER 💈
          </h1>
          <h2 className="text-xl font-bold text-red-400 mb-4">
            Sistema de Gestão
          </h2>
          <p className="text-sm text-gray-300">
            Administração profissional para barbearias clássicas
          </p>
          
          {/* Ícones decorativos */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <IconFallback type="scissors" size="md" className="opacity-70" />
            <div className="w-px h-4 bg-yellow-500"></div>
            <IconFallback type="razor" size="md" className="opacity-70" />
            <div className="w-px h-4 bg-red-500"></div>
            <IconFallback type="comb" size="md" className="opacity-70" />
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-gray-300 mb-4">Redirecionando para o painel administrativo...</p>
            <div className="flex justify-center items-center space-x-2">
              <IconFallback type="barber-pole" size="md" className="animate-spin" />
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
            </div>
          </div>
          
          <button
            onClick={handleGoToAdmin}
            className="group relative w-full flex justify-center py-4 px-6 border-2 border-yellow-500 text-sm font-bold rounded-lg text-black bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <IconFallback type="scissors" size="sm" className="mr-2" />
            ACESSAR PAINEL ADMINISTRATIVO
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 bg-gray-800 bg-opacity-50 rounded-lg p-3 border border-gray-700">
          <div className="flex justify-center items-center mb-2">
            <IconFallback type="hair-clipper" size="sm" className="mr-2 opacity-50" />
            <span className="font-semibold text-yellow-400">TECNOLOGIAS UTILIZADAS</span>
          </div>
          <p>Backend: FastAPI + SQLAlchemy + PostgreSQL</p>
          <p>Frontend: Next.js + TypeScript + TailwindCSS</p>
          <p className="mt-1 text-red-400">🔒 Sistema seguro com autenticação JWT</p>
        </div>
      </div>
      
      {/* Barber pole no fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <IconFallback type="barber-pole" size="lg" className="text-9xl" />
      </div>
    </div>
  );
}
