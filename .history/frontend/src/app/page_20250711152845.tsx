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
          {/* Áreas de Acesso */}
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
