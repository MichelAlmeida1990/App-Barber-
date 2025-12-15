'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconFallback } from '@/components/IconFallback';

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
}

export default function BarberDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayAppointments: 0,
    weeklyRevenue: 0,
    totalClients: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação
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
    loadDashboardData(token);
  }, [router]);

  const loadDashboardData = async (token: string) => {
    try {
      // Carregar agendamentos
      const appointmentsResponse = await fetch(
        'http://localhost:8000/api/v1/appointments/my-appointments',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
        
        // Calcular estatísticas
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointmentsData.filter((apt: Appointment) => 
          apt.appointment_date.startsWith(today)
        );
        
        const completedToday = todayAppointments.filter((apt: Appointment) => 
          apt.status === 'completed'
        ).length;

        const weeklyRevenue = appointmentsData
          .filter((apt: Appointment) => apt.status === 'completed')
          .reduce((total: number, apt: Appointment) => total + apt.total_price, 0);

        setStats({
          todayAppointments: todayAppointments.length,
          weeklyRevenue,
          totalClients: new Set(appointmentsData.map((apt: Appointment) => apt.client_name)).size,
          completedToday
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:8002/api/v1/appointments/${appointmentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (response.ok) {
        // Recarregar dados
        loadDashboardData(token!);
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/barber/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'confirmed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-500';
      case 'no_show': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'in_progress': return 'Em Atendimento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'Não Compareceu';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IconFallback type="scissors" size="lg" className="text-red-500 mx-auto mb-4 animate-spin" />
          <p className="text-white">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-red-600 p-2 rounded-full">
              <IconFallback type="scissors" size="md" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Painel do Barbeiro</h1>
              <p className="text-gray-300 text-sm">
                Bem-vindo, {user?.full_name || 'Barbeiro'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Agendamentos Hoje</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <IconFallback type="barber-chair" size="lg" className="text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Concluídos Hoje</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
              <IconFallback type="scissors" size="lg" className="text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Receita Semanal</p>
                <p className="text-2xl font-bold">R$ {stats.weeklyRevenue.toFixed(2)}</p>
              </div>
              <IconFallback type="barber-pole" size="lg" className="text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total de Clientes</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <IconFallback type="comb" size="lg" className="text-purple-200" />
            </div>
          </div>
        </div>

        {/* Agenda do Dia */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <IconFallback type="barber-chair" size="md" className="mr-2 text-red-500" />
                Agenda de Hoje
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {appointments.filter(apt => apt.appointment_date.startsWith(selectedDate)).length === 0 ? (
              <div className="p-12 text-center">
                <IconFallback type="barber-chair" size="lg" className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Nenhum agendamento para este dia
                </h3>
                <p className="text-gray-500">
                  Aproveite para descansar ou fazer marketing!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {appointments
                  .filter(apt => apt.appointment_date.startsWith(selectedDate))
                  .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                  .map((appointment) => (
                    <div key={appointment.id} className="p-6 hover:bg-gray-750 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                              <span className="text-white font-semibold">
                                {appointment.client_name}
                              </span>
                            </div>
                            <span className="text-gray-300 text-sm">
                              {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-gray-300 text-sm">
                              Serviços: {appointment.services?.map(s => s.name).join(', ') || 'N/A'}
                            </p>
                            <p className="text-green-400 text-sm font-semibold">
                              Valor: R$ {appointment.total_price.toFixed(2)}
                            </p>
                            {appointment.notes && (
                              <p className="text-gray-400 text-sm mt-1">
                                Obs: {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'scheduled' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Confirmar
                            </button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Iniciar
                            </button>
                          )}
                          {appointment.status === 'in_progress' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Finalizar
                            </button>
                          )}
                          {['scheduled', 'confirmed'].includes(appointment.status) && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/barber/schedule"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition-colors group"
          >
            <div className="text-center">
              <IconFallback type="barber-chair" size="lg" className="text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Minha Agenda</h3>
              <p className="text-gray-400 text-sm">Ver agenda completa</p>
            </div>
          </Link>

          <Link
            href="/barber/clients"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition-colors group"
          >
            <div className="text-center">
              <IconFallback type="comb" size="lg" className="text-yellow-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Meus Clientes</h3>
              <p className="text-gray-400 text-sm">Histórico e dados</p>
            </div>
          </Link>

          <Link
            href="/barber/earnings"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition-colors group"
          >
            <div className="text-center">
              <IconFallback type="barber-pole" size="lg" className="text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Ganhos</h3>
              <p className="text-gray-400 text-sm">Relatórios financeiros</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 