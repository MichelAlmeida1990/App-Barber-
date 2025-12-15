'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFallback } from '@/components/IconFallback';
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Appointment {
  id: number;
  client_name: string;
  services: { name: string; price: number }[];
  appointment_date: string;
  status: string;
  total_price: number;
  notes?: string;
}

interface Stats {
  todayAppointments: number;
  weeklyRevenue: number;
  totalClients: number;
  completedToday: number;
  monthlyCommissions: number;
}

export default function BarberDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayAppointments: 0,
    weeklyRevenue: 0,
    totalClients: 0,
    completedToday: 0,
    monthlyCommissions: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/barber/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'barber') {
      router.push('/barber/login');
      return;
    }

    setUser(parsedUser);
    loadDashboardData(token, parsedUser.barber_id);
  }, [router]);

  const loadDashboardData = async (token: string, barberId: number) => {
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/appointments/barber-appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        
        // Verificar se a resposta é um array ou objeto com propriedade data/appointments
        const data = Array.isArray(result) ? result : (result.data || result.appointments || []);
        
        if (!Array.isArray(data)) {
          console.error('Data is not an array:', data);
          setAppointments([]);
          return;
        }
        
        setAppointments(data);

        const today = new Date().toDateString();
        const todayAppts = data.filter((a: Appointment) => 
          new Date(a.appointment_date).toDateString() === today
        );
        
        const completed = todayAppts.filter((a: Appointment) => a.status === 'completed');
        
        setStats({
          todayAppointments: todayAppts.length,
          weeklyRevenue: data.reduce((acc: number, a: Appointment) => acc + (a.total_price || 0), 0),
          totalClients: new Set(data.map((a: Appointment) => a.client_name)).size,
          completedToday: completed.length,
          monthlyCommissions: 0 // Será carregado de outra API
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/barber/login');
  };

  const todayAppointments = appointments.filter(a => 
    new Date(a.appointment_date).toDateString() === new Date().toDateString()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            <FireIcon className="w-10 h-10 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Carregando painel profissional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements - Suaves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-2xl">
                    <IconFallback type="scissors" size="md" className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Painel Profissional</h1>
                  <p className="text-gray-600 text-sm flex items-center">
                    <TrophyIcon className="w-4 h-4 mr-1" />
                    {user?.full_name} - Elite Barber
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-gray-700 transition-all duration-300 hover:scale-105"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stat Card 1 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <CalendarDaysIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-gray-900">{stats.todayAppointments}</p>
                    <p className="text-gray-600 text-sm font-medium">Hoje</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm font-medium">Agendamentos</span>
                  <div className="flex items-center space-x-1 text-green-600 text-xs font-bold">
                    <FireIcon className="w-4 h-4" />
                    <span>Ativo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-gray-900">{stats.completedToday}</p>
                    <p className="text-gray-600 text-sm font-medium">Concluídos</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm font-medium">Hoje</span>
                  <div className="flex items-center space-x-1 text-green-600 text-xs font-bold">
                    <ChartBarIcon className="w-4 h-4" />
                    <span>{stats.completedToday > 0 ? '+' : ''}0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <UsersIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-gray-900">{stats.totalClients}</p>
                    <p className="text-gray-600 text-sm font-medium">Clientes</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm font-medium">Total</span>
                  <div className="flex items-center space-x-1 text-blue-600 text-xs font-bold">
                    <TrophyIcon className="w-4 h-4" />
                    <span>Fidelidade</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-gray-900">R$ {stats.weeklyRevenue.toFixed(0)}</p>
                    <p className="text-gray-600 text-sm font-medium">Receita</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm font-medium">Semanal</span>
                  <div className="flex items-center space-x-1 text-yellow-600 text-xs font-bold">
                    <SparklesIcon className="w-4 h-4" />
                    <span>Crescendo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <FireIcon className="w-8 h-8 mr-3 text-red-600" />
                Agenda de Hoje
              </h2>
              <Link
                href="/barber/schedule"
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-md"
              >
                Ver Completa
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {todayAppointments.length === 0 ? (
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                  <CalendarDaysIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-medium">Nenhum agendamento para hoje</p>
                  <p className="text-gray-400 text-sm mt-2">Aproveite para descansar ou atualizar seu perfil</p>
                </div>
              ) : (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:transform hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-xl">
                                {appointment.client_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="text-gray-900 font-bold text-lg">{appointment.client_name}</h3>
                            <p className="text-gray-600 text-sm flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg font-semibold text-sm shadow-sm ${
                          appointment.status === 'completed' 
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : appointment.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {appointment.status === 'completed' ? 'Concluído' : 
                           appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {appointment.services?.map((service, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center space-x-2">
                              <IconFallback type="scissors" size="sm" className="text-red-600" />
                              <span className="text-gray-800 font-medium">{service.name}</span>
                            </div>
                            <span className="text-red-600 font-bold">R$ {service.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-gray-600 font-medium">Total</span>
                        <span className="text-2xl font-black text-gray-900">
                          R$ {appointment.total_price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <SparklesIcon className="w-7 h-7 mr-2 text-yellow-600" />
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/barber/schedule"
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                      <CalendarDaysIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-gray-900 font-bold text-lg mb-2">Agenda</h4>
                    <p className="text-gray-600 text-sm">Ver calendário completo</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/barber/blocks"
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                      <IconFallback type="scissors" size="md" className="text-white" />
                    </div>
                    <h4 className="text-gray-900 font-bold text-lg mb-2">Bloqueios</h4>
                    <p className="text-gray-600 text-sm">Gerenciar disponibilidade</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/barber/clients"
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                      <UsersIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-gray-900 font-bold text-lg mb-2">Clientes</h4>
                    <p className="text-gray-600 text-sm">Histórico e dados</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/barber/commissions"
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                      <BanknotesIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-gray-900 font-bold text-lg mb-2">Comissões</h4>
                    <p className="text-gray-600 text-sm">Ver detalhes e histórico</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
