'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFallback } from '@/components/IconFallback';
import { BackgroundImage } from '@/components/BackgroundImage';
import { NotificationToast } from '@/components/NotificationToast';

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  const handleClientClick = () => {
    setShowNotification(true);
  };

  const handleBarberClick = () => {
    setShowNotification(true);
  };

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <BackgroundImage 
        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&h=900&fit=crop&crop=center&auto=format&q=80"
        fallbackClass="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      >
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/90"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-red-400 rounded-full animate-ping opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce opacity-50"></div>
        </div>
        
        <div className={`relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            {/* Modern Logo */}
            <div className="flex justify-center mb-4 sm:mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-4 sm:p-6 md:p-8 rounded-full shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  <IconFallback type="barber-pole" size="xl" className="text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-2 sm:p-3 shadow-lg">
                  <IconFallback type="scissors" size="sm" className="text-white" />
                </div>
              </div>
            </div>

            {/* Modern Title */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2 sm:mb-4 tracking-tight">
              BARBERSHOP
              <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-1 sm:mt-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                MANAGER
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-gray-200 mb-2 sm:mb-3 px-2">
              Sistema Completo de Gestão
            </p>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 font-medium px-2">
              🚀 Agendamentos • 💰 Vendas • 📊 Analytics • 🤖 IA
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 text-green-300 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full mr-2 sm:mr-3 animate-pulse shadow-lg"></div>
              <span className="whitespace-nowrap">Sistema Online e Funcionando</span>
            </div>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Cliente Card */}
            <Link
              href="/client/login"
              className="group relative overflow-hidden"
              onClick={handleClientClick}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 text-center transform group-hover:scale-105 transition-all duration-300 hover:bg-white/15">
                <div className="mb-4 sm:mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconFallback type="barber-chair" size="lg" className="text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">ÁREA DO CLIENTE</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">Agendar cortes e serviços</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>

            {/* Barbeiro Card */}
            <Link
              href="/barber/login"
              className="group relative overflow-hidden"
              onClick={handleBarberClick}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 text-center transform group-hover:scale-105 transition-all duration-300 hover:bg-white/15">
                <div className="mb-4 sm:mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconFallback type="scissors" size="lg" className="text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">ÁREA DO BARBEIRO</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">Painel profissional</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          </div>
            
          {/* Admin Panel */}
          <div className="text-center mb-6 sm:mb-8">
            <button
              onClick={handleGoToAdmin}
              className="group relative inline-flex items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/50 text-gray-200 rounded-xl backdrop-blur-md hover:from-gray-700/50 hover:to-gray-800/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black/50 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base md:text-lg font-semibold"
            >
              <IconFallback type="comb" size="md" className="mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
              <span className="whitespace-nowrap">PAINEL ADMINISTRATIVO</span>
            </button>
          </div>

          {/* Technologies Section */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 text-center">
            <div className="flex flex-col sm:flex-row justify-center items-center mb-3 sm:mb-4">
              <IconFallback type="hair-clipper" size="md" className="mr-0 sm:mr-3 mb-2 sm:mb-0 text-yellow-400" />
              <span className="text-base sm:text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                TECNOLOGIAS UTILIZADAS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-300 font-medium">Backend</p>
                <p className="text-gray-400 break-words">FastAPI + SQLAlchemy + PostgreSQL</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-300 font-medium">Frontend</p>
                <p className="text-gray-400 break-words">Next.js + TypeScript + TailwindCSS</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
              <p className="text-emerald-400 font-medium flex flex-col sm:flex-row items-center justify-center text-xs sm:text-sm">
                <span className="mb-1 sm:mb-0 sm:mr-2">🔒</span>
                <span>Sistema seguro com autenticação JWT</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-yellow-400/10 text-6xl animate-float">💈</div>
          <div className="absolute bottom-1/4 right-1/4 text-red-400/10 text-4xl animate-float-delayed">✂️</div>
          <div className="absolute top-1/2 right-1/4 text-blue-400/10 text-5xl animate-float-slow">💺</div>
        </div>
      </BackgroundImage>

      {/* Notification Toast */}
      {showNotification && (
        <NotificationToast
          message="Funcionalidade em desenvolvimento! Em breve disponível."
          type="info"
          duration={3000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}
