'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFallback } from '@/components/IconFallback';

export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8002/api/v1/auth/login', {
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
      
      // Verificar se é cliente
      if (data.user.role !== 'client') {
        setError('Acesso negado. Esta área é exclusiva para clientes.');
        return;
      }

      // Salvar token
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirecionar para área do cliente
      router.push('/client/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8002/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          phone,
          role: 'client'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar conta');
      }

      // Fazer login automaticamente após registro
      await handleLogin(e);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-800 to-amber-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-full">
              <IconFallback type="barber-chair" size="lg" className="text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ÁREA DO CLIENTE
          </h1>
          <p className="text-yellow-100">
            {showRegister ? 'Crie sua conta' : 'Faça seu agendamento'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl">
          <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {showRegister && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconFallback type="barber-chair" size="sm" className="text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconFallback type="comb" size="sm" className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {showRegister && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconFallback type="barber-pole" size="sm" className="text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconFallback type="scissors" size="sm" className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {showRegister && (
                <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  {showRegister ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                <>
                  <IconFallback type="barber-chair" size="sm" className="mr-2" />
                  {showRegister ? 'CRIAR CONTA' : 'ENTRAR'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowRegister(!showRegister);
                setError('');
              }}
              className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
            >
              {showRegister ? 'Já tem conta? Fazer login' : 'Primeira vez aqui? Criar conta'}
            </button>
          </div>

          {/* Links */}
          <div className="mt-6 space-y-4">
            {!showRegister && (
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            )}

            <div className="border-t border-gray-600 pt-4">
              <div className="text-center text-gray-400 text-sm">
                Área exclusiva para clientes
              </div>
              <div className="text-center mt-2">
                <Link
                  href="/barber/login"
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  É barbeiro? Clique aqui
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4">
            <IconFallback type="scissors" size="md" className="text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm">Agendamento Online</h3>
            <p className="text-gray-300 text-xs">24h por dia</p>
          </div>
          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4">
            <IconFallback type="barber-chair" size="md" className="text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm">Histórico</h3>
            <p className="text-gray-300 text-xs">Seus cortes</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <div className="flex justify-center items-center mb-2">
            <IconFallback type="barber-pole" size="sm" className="mr-2 opacity-50" />
            <span>Sistema de Agendamento Online</span>
          </div>
          <p>© 2024 Barbershop Manager. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
} 