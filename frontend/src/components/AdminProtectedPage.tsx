'use client';

import { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminProtectedPageProps {
  children: ReactNode;
}

export default function AdminProtectedPage({ children }: AdminProtectedPageProps) {
  const { loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">🔒 Verificando autenticação...</p>
          <p className="text-white/60 text-sm mt-2">Aguarde enquanto validamos seu acesso</p>
        </div>
      </div>
    );
  }

  // Se chegou aqui, está autenticado e autorizado
  return <>{children}</>;
}











