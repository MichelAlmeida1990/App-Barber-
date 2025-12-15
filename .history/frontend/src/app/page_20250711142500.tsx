'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <Image src="/images/barbershop/scissors.svg" alt="" width={60} height={60} className="animate-pulse" />
        </div>
        <div className="absolute top-20 right-20">
          <Image src="/images/barbershop/razor.svg" alt="" width={80} height={40} className="animate-pulse delay-1000" />
        </div>
        <div className="absolute bottom-20 left-20">
          <Image src="/images/barbershop/comb.svg" alt="" width={100} height={30} className="animate-pulse delay-2000" />
        </div>
        <div className="absolute bottom-10 right-10">
          <Image src="/images/barbershop/hair-clipper.svg" alt="" width={40} height={80} className="animate-pulse delay-500" />
        </div>
        <div className="absolute top-1/2 left-5">
          <Image src="/images/barbershop/barber-chair.svg" alt="" width={80} height={80} className="animate-pulse delay-1500" />
        </div>
        <div className="absolute top-1/3 right-5">
          <Image src="/images/barbershop/barber-pole.svg" alt="" width={40} height={120} className="animate-pulse delay-700" />
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 p-8 bg-black bg-opacity-30 backdrop-blur-sm rounded-xl border border-yellow-600/30 shadow-2xl">
        <div className="text-center">
          {/* Logo principal */}
          <div className="mx-auto mb-6">
            <Image 
              src="/images/barbershop/logo.svg" 
              alt="Barber Shop Logo" 
              width={120} 
              height={60} 
              className="mx-auto"
            />
          </div>
          
          <h1 className="text-4xl font-extrabold text-yellow-300 mb-2">
            Elite Barber Shop
          </h1>
          <h2 className="text-xl font-bold text-yellow-100 mb-4">
            Sistema de Gestão
          </h2>
          <p className="text-sm text-yellow-200">
            Administração completa para barbearias modernas
          </p>
          
          {/* Ícones decorativos */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <Image src="/images/barbershop/scissors.svg" alt="Scissors" width={24} height={24} className="opacity-70" />
            <div className="w-px h-4 bg-yellow-400"></div>
            <Image src="/images/barbershop/razor.svg" alt="Razor" width={32} height={20} className="opacity-70" />
            <div className="w-px h-4 bg-yellow-400"></div>
            <Image src="/images/barbershop/comb.svg" alt="Comb" width={36} height={12} className="opacity-70" />
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-yellow-100 mb-4">Redirecionando para o painel administrativo...</p>
            <div className="flex justify-center items-center space-x-2">
              <Image src="/images/barbershop/barber-pole.svg" alt="" width={20} height={40} className="animate-spin" />
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
            </div>
          </div>
          
          <button
            onClick={handleGoToAdmin}
            className="group relative w-full flex justify-center py-3 px-4 border-2 border-yellow-600 text-sm font-medium rounded-md text-yellow-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Image src="/images/barbershop/scissors.svg" alt="" width={16} height={16} className="mr-2" />
            Acessar Painel Administrativo
          </button>
        </div>

        <div className="text-center text-xs text-yellow-300 bg-black bg-opacity-20 rounded-lg p-3">
          <div className="flex justify-center items-center mb-2">
            <Image src="/images/barbershop/hair-clipper.svg" alt="" width={16} height={16} className="mr-2 opacity-50" />
            <span className="font-semibold">Tecnologias Utilizadas</span>
          </div>
          <p>Backend: FastAPI + SQLAlchemy + PostgreSQL</p>
          <p>Frontend: Next.js + TypeScript + TailwindCSS</p>
          <p className="mt-1 text-yellow-400">🔒 Sistema seguro com autenticação JWT</p>
        </div>
      </div>
      
      {/* Sombra do logo no fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Image 
          src="/images/barbershop/logo.svg" 
          alt="" 
          width={400} 
          height={200} 
          className="transform scale-150"
        />
      </div>
    </div>
  );
}
