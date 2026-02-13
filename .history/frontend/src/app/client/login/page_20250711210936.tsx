'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFallback } from '@/components/IconFallback';
import GoogleLoginButton from '@/components/GoogleLoginButton';

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
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
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

  const handleGoogleSuccess = async (token: string) => {
    setLoading(true);
    setError('');

    try {
      // O token já vem processado do backend
      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao obter dados do usuário');
      }

      const userData = await response.json();
      
      // Verificar se é cliente
      if (userData.role !== 'client') {
        setError('Acesso negado. Esta área é exclusiva para clientes.');
        return;
      }

      // Salvar token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirecionar para área do cliente
      router.push('/client/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Erro do Google OAuth:', error);
    setError('Erro ao conectar com Google. Tente novamente.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-2xl">
                <IconFallback type="barber-chair" size="lg" className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Área do Cliente
          </h1>
          <p className="text-blue-200 text-lg">
            {showRegister ? 'Crie sua conta para começar' : 'Entre na sua conta'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
          <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {showRegister && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-white/90 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconFallback type="barber-chair" size="sm" className="text-blue-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconFallback type="comb" size="sm" className="text-blue-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {showRegister && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white/90 mb-2">
                  Telefone (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconFallback type="barber-pole" size="sm" className="text-blue-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconFallback type="scissors" size="sm" className="text-blue-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
              {showRegister && (
                <p className="text-xs text-white/60 mt-1">Mínimo 6 caracteres</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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

          {/* Google Login */}
          {!showRegister && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/10 backdrop-blur-sm text-white/80 rounded-lg">ou continue com</span>
                </div>
              </div>
              <div className="mt-4">
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={loading}
                  text="Entrar com Google"
                />
              </div>
            </div>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowRegister(!showRegister);
                setError('');
              }}
              className="text-blue-300 hover:text-blue-200 text-sm transition-colors font-medium"
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
                  className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            )}

            <div className="border-t border-white/20 pt-4">
              <div className="text-center text-white/70 text-sm">
                Área exclusiva para clientes
              </div>
              <div className="text-center mt-2">
                <Link
                  href="/barber/login"
                  className="text-red-300 hover:text-red-200 text-sm transition-colors"
                >
                  É barbeiro? Clique aqui
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200">
            <IconFallback type="scissors" size="md" className="text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-sm">Agendamento Online</h3>
            <p className="text-white/60 text-xs mt-1">24h por dia, 7 dias por semana</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200">
            <IconFallback type="barber-chair" size="md" className="text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-sm">Histórico Completo</h3>
            <p className="text-white/60 text-xs mt-1">Acompanhe seus cortes</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <div className="flex justify-center items-center mb-2">
            <IconFallback type="barber-pole" size="sm" className="mr-2 opacity-60" />
            <span>Sistema Moderno de Agendamento</span>
          </div>
          <p>© 2024 Barbershop Manager. Design moderno e funcional.</p>
        </div>
      </div>
    </div>
  );
} 