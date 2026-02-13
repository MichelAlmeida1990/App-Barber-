'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFallback } from '@/components/IconFallback';

export default function Home() {
  const router = useRouter();

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  useEffect(() => {
    // Opcional: redirecionar automaticamente após alguns segundos
    // const timer = setTimeout(() => {
    //   router.push('/admin');
    // }, 3000);
    // return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&h=900&fit=crop&crop=center&auto=format&q=80)'
        }}
      ></div>
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      {/* Gradient Overlay for enhanced depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/80"></div>
      
      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-300 p-6 rounded-full shadow-2xl">
              <IconFallback type="barber-pole" size="xl" className="text-black" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-600 rounded-full p-2">
              <IconFallback type="scissors" size="sm" className="text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          BARBERSHOP
          <span className="block text-2xl font-semibold text-yellow-400 mt-1">
            MANAGER
          </span>
        </h1>
        
        <p className="text-gray-300 text-lg mb-2">
          Sistema Completo de Gestão
        </p>
        <p className="text-gray-400 text-sm mb-8">
          🚀 Agendamentos • 💰 Vendas • 📊 Analytics • 🤖 IA
        </p>

        {/* Status Indicator */}
        <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-4 py-2 rounded-lg text-sm mb-8 inline-flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Sistema Online e Funcionando
        </div>

        {/* Áreas de Acesso */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Área do Cliente */}
            <Link
              href="/client/login"
              className="group relative flex flex-col justify-center py-6 px-6 border-2 border-yellow-500 text-sm font-bold rounded-lg text-black bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-center">
                <IconFallback type="barber-chair" size="lg" className="mx-auto mb-2" />
                <div className="text-lg font-bold">ÁREA DO CLIENTE</div>
                <div className="text-xs font-normal opacity-80">Agendar cortes</div>
              </div>
            </Link>

            {/* Área do Barbeiro */}
            <Link
              href="/barber/login"
              className="group relative flex flex-col justify-center py-6 px-6 border-2 border-red-500 text-sm font-bold rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-center">
                <IconFallback type="scissors" size="lg" className="mx-auto mb-2" />
                <div className="text-lg font-bold">ÁREA DO BARBEIRO</div>
                <div className="text-xs font-normal opacity-80">Painel profissional</div>
              </div>
            </Link>
          </div>
          
          {/* Painel Administrativo */}
          <button
            onClick={handleGoToAdmin}
            className="group relative w-full flex justify-center py-3 px-6 border border-gray-600 text-sm font-semibold rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          >
            <IconFallback type="comb" size="sm" className="mr-2" />
            PAINEL ADMINISTRATIVO
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 bg-gray-800 bg-opacity-50 rounded-lg p-3 border border-gray-700 mt-8">
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
