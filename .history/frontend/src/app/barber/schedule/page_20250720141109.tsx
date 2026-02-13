'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
  id: number;
  client_name: string;
  services: { name: string; price: number }[];
  appointment_date: string;
  status: string;
  total_price: number;
  notes?: string;
}

export default function BarberSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
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

    loadAppointments(token);
  }, [router]);

  const loadAppointments = async (token: string) => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/appointments/barber-appointments',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        console.error('Erro ao carregar agendamentos');
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/v1/appointments/${appointmentId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      );

      if (response.ok) {
        // Recarregar agendamentos
        loadAppointments(token!);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/barber/login');
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-yellow-500';
      case 'CONFIRMED':
        return 'bg-blue-500';
      case 'IN_PROGRESS':
        return 'bg-orange-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'Agendado';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const dateMatch = apt.appointment_date.startsWith(selectedDate);
    const statusMatch = filterStatus === 'all' || apt.status.toUpperCase() === filterStatus.toUpperCase();
    return dateMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/barber/dashboard" className="text-white hover:text-gray-300 mr-6">
                ← Voltar ao Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Minha Agenda Completa</h1>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
              >
                <option value="all">Todos</option>
                <option value="SCHEDULED">Agendado</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                  setFilterStatus('all');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total de Agendamentos</p>
              <p className="text-2xl font-bold text-white">{filteredAppointments.length}</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Concluídos</p>
              <p className="text-2xl font-bold text-green-400">
                {filteredAppointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">
                {filteredAppointments.filter(apt => ['scheduled', 'confirmed'].includes(apt.status)).length}
              </p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Receita Total</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {filteredAppointments.reduce((sum, apt) => sum + apt.total_price, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Agendamentos</h2>
          </div>

          <div className="overflow-x-auto">
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-600 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros ou verificar outra data.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredAppointments
                  .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                  .map((appointment) => (
                    <div key={appointment.id} className="p-6 hover:bg-gray-750 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                              <span className="text-white font-semibold text-lg">
                                {appointment.client_name}
                              </span>
                            </div>
                            <span className="text-gray-300">
                              {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm">Serviços:</p>
                              <p className="text-white">
                                {appointment.services?.map(s => s.name).join(', ') || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Valor:</p>
                              <p className="text-green-400 font-semibold">
                                R$ {appointment.total_price.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Duração:</p>
                              <p className="text-white">
                                {appointment.services?.reduce((sum, s) => sum + (s.price / 10), 0).toFixed(0)} min
                              </p>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-3">
                              <p className="text-gray-400 text-sm">Observações:</p>
                              <p className="text-white italic">{appointment.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col space-y-2 ml-6">
                          {appointment.status === 'SCHEDULED' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
                            >
                              Confirmar
                            </button>
                          )}
                          {appointment.status === 'CONFIRMED' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'IN_PROGRESS')}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition-colors"
                            >
                              Iniciar
                            </button>
                          )}
                          {appointment.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                            >
                              Finalizar
                            </button>
                          )}
                          {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
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
      </div>
    </div>
  );
} 