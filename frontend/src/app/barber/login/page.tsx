'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFallback } from '@/components/IconFallback';

export default function BarberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      
      // Verificar se é barbeiro
      if (data.user.role !== 'barber') {
        setError('Acesso negado. Esta área é exclusiva para barbeiros.');
        return;
      }

      // Salvar token
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirecionar para dashboard do barbeiro
      router.push('/barber/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-barbershop-barber bg-image-loading"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1600&h=900&fit=crop&crop=center&auto=format&q=80)'
        }}
        onError={(e) => {
          // Remove a imagem do Unsplash e usa o fallback CSS
          e.currentTarget.style.backgroundImage = '';
        }}
      ></div>
      
      {/* Red Overlay for barber area theme */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-80"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-transparent to-black/90"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-full">
              <IconFallback type="scissors" size="lg" className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ÁREA DO BARBEIRO
          </h1>
          <p className="text-gray-300">
            Acesse seu painel profissional
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconFallback type="razor" size="sm" className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="seu.email@barbearia.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconFallback type="hair-clipper" size="sm" className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <IconFallback type="barber-pole" size="sm" className="mr-2" />
                  ENTRAR NO PAINEL
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            <div className="border-t border-gray-600 pt-4">
              <div className="text-center text-gray-400 text-sm">
                Área exclusiva para barbeiros
              </div>
              <div className="text-center mt-2 space-x-4">
                <Link
                  href="/client/login"
                  className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                >
                  É cliente? Clique aqui
                </Link>
                <span className="text-gray-600">•</span>
                <Link
                  href="/admin/login"
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Área Admin
                </Link>
              </div>
              <div className="text-center mt-3">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-400 text-sm transition-colors inline-flex items-center"
                >
                  ← Voltar ao início
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <div className="flex justify-center items-center mb-2">
            <IconFallback type="scissors" size="sm" className="mr-2 opacity-50" />
            <span>Sistema Profissional de Barbearia</span>
          </div>
          <p>© 2024 Barbershop Manager. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
} 