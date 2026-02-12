'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFallback } from '@/components/IconFallback';
import BookingWizard from '@/components/booking/BookingWizard';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Appointment {
  id: number;
  barber_name: string;
  services: { name: string; price: number }[];
  appointment_date: string;
  status: string;
  total_price: number;
  notes?: string;
}

interface Barber {
  id: number;
  name: string;
  specialties: string[];
  rating: number;
  avatar_url?: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  description: string;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [appointmentCode, setAppointmentCode] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/client/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'client') {
      router.push('/client/login');
      return;
    }

    setUser(parsedUser);
    loadDashboardData(token);
  }, [router]);

  const loadDashboardData = async (token: string) => {
    setLoading(true);
    
    try {
      // Limpar agendamentos expirados PRIMEIRO
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/appointments/cleanup/expired`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (cleanupError) {
        console.warn('Aviso ao limpar agendamentos expirados:', cleanupError);
        // Não bloqueia o carregamento se limpeza falhar
      }

      const appointmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/appointments/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      }

      const barbersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/barbers/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (barbersResponse.ok) {
        const barbersData = await barbersResponse.json();
        setBarbers(barbersData.barbers || barbersData || []);
      }

      const servicesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/services/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.services || servicesData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = (code: string) => {
    setAppointmentCode(code);
    setShowBooking(false);
    setShowConfirmation(true);
    const token = localStorage.getItem('token');
    if (token) loadDashboardData(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/client/login');
  };

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      'pending': { label: 'Pendente', color: 'from-yellow-400 to-orange-500', icon: ClockIcon },
      'confirmed': { label: 'Confirmado', color: 'from-blue-400 to-blue-600', icon: CheckCircleIcon },
      'completed': { label: 'Concluído', color: 'from-green-400 to-green-600', icon: CheckCircleIcon },
      'cancelled': { label: 'Cancelado', color: 'from-red-400 to-red-600', icon: XCircleIcon },
    };
    return statusMap[status] || statusMap['pending'];
  };

  const upcomingAppointments = appointments.filter(a => 
    ['pending', 'confirmed'].includes(a.status)
  );
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  // Agenda semanal - organiza agendamentos por dia da semana
  const getWeeklyAgenda = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekDays: any = {};
    
    // Inicializar 7 dias da semana
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      weekDays[key] = {
        date: date,
        dayName: dayNames[date.getDay()],
        dayNum: date.getDate(),
        appointments: []
      };
    }
    
    // Agrupar agendamentos por dia (apenas próxima semana)
    upcomingAppointments.forEach((apt) => {
      const aptDate = new Date(apt.appointment_date);
      aptDate.setHours(0, 0, 0, 0);
      const key = aptDate.toISOString().split('T')[0];
      
      if (weekDays[key]) {
        weekDays[key].appointments.push(apt);
      }
    });
    
    return Object.values(weekDays);
  };

  const weeklyAgenda = getWeeklyAgenda();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <SparklesIcon className="w-10 h-10 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-purple-200 text-lg font-medium">Carregando sua experiência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Glassmorphism */}
        <div className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                    <IconFallback type="barber-chair" size="md" className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Olá, {user?.full_name}!</h1>
                  <p className="text-purple-200 text-sm">Bem-vindo de volta ✨</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white transition-all duration-300 hover:scale-105"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero CTA Card */}
          <div className="mb-8 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-gradient"></div>
            <div className="relative backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 rounded-3xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Pronto para um novo visual?</h2>
                  <p className="text-purple-200 text-lg mb-6">Agende seu horário com os melhores profissionais</p>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                  >
                    <SparklesIcon className="w-6 h-6 mr-2 animate-spin-slow" />
                    Agendar Agora
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="hidden lg:block">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                    <IconFallback type="scissors" size="lg" className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative backdrop-blur-xl bg-blue-500/10 border border-white/20 rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <CalendarIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{upcomingAppointments.length}</p>
                    <p className="text-blue-200 text-sm">Próximos</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative backdrop-blur-xl bg-green-500/10 border border-white/20 rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{completedAppointments.length}</p>
                    <p className="text-green-200 text-sm">Concluídos</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative backdrop-blur-xl bg-yellow-500/10 border border-white/20 rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <StarIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{appointments.length}</p>
                    <p className="text-yellow-200 text-sm">Total</p>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Appointments Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CalendarIcon className="w-7 h-7 mr-2 text-purple-400" />
              Agenda da Semana
            </h3>
            
            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weeklyAgenda.map((day: any, idx: number) => (
                <div key={idx} className="group relative">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${day.appointments.length > 0 ? 'from-purple-600 to-pink-600' : 'from-gray-600 to-gray-700'} rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300`}></div>
                  <div className={`relative backdrop-blur-xl border rounded-xl p-4 transition-all duration-300 ${
                    day.appointments.length > 0
                      ? 'bg-white/15 border-white/30 hover:scale-105'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    {/* Day Header */}
                    <div className="text-center mb-3 pb-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-purple-300">{day.dayName}</p>
                      <p className="text-2xl font-bold text-white">{day.dayNum}</p>
                    </div>
                    
                    {/* Appointments for this day */}
                    {day.appointments.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-400">Sem agendamentos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {day.appointments.map((apt: any) => {
                          const statusInfo = getStatusInfo(apt.status);
                          const time = new Date(apt.appointment_date).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          });
                          return (
                            <div key={apt.id} className="bg-white/10 rounded-lg p-2 text-xs border border-white/10">
                              <p className="font-semibold text-white truncate">{apt.barber_name}</p>
                              <p className="text-purple-300">{time}</p>
                              <p className={`text-xs mt-1 inline-block px-2 py-1 rounded bg-gradient-to-r ${statusInfo.color} text-white`}>
                                {statusInfo.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Total de agendamentos esta semana</p>
                  <p className="text-3xl font-bold text-white">{upcomingAppointments.length}</p>
                </div>
                <button
                  onClick={() => setShowBooking(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:scale-105 transition-transform"
                >
                  + Novo Agendamento
                </button>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CheckCircleIcon className="w-7 h-7 mr-2 text-green-400" />
              Histórico Recente
            </h3>
            <div className="space-y-4">
              {completedAppointments.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <CheckCircleIcon className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                  <p className="text-purple-200">Nenhum serviço concluído ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {completedAppointments.slice(0, 6).map((appointment) => (
                    <div key={appointment.id} className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                      <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:transform hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-green-500/20 rounded-xl">
                            <CheckCircleIcon className="w-6 h-6 text-green-400" />
                          </div>
                          <span className="text-white font-bold text-lg">R$ {appointment.total_price?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">{appointment.barber_name}</h4>
                          <p className="text-purple-200 text-sm">{new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action */}
          <div className="mt-8">
            <Link
              href="/consultar-agendamento"
              target="_blank"
              className="block group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative backdrop-blur-xl bg-cyan-500/10 border border-white/20 rounded-2xl p-6 hover:transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <IconFallback type="barber-chair" size="md" className="text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">Consultar Código de Agendamento</h4>
                      <p className="text-cyan-200 text-sm">Verifique detalhes do seu agendamento</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-6 h-6 text-cyan-400 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BookingWizard
              barbers={barbers}
              services={services}
              onClose={() => setShowBooking(false)}
              onComplete={handleBookingComplete}
            />
          </div>
        </div>
      )}

      {showConfirmation && appointmentCode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <BookingConfirmation
            appointmentCode={appointmentCode}
            onClose={() => setShowConfirmation(false)}
          />
        </div>
      )}

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
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
