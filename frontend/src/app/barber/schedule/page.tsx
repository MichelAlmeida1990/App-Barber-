'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Appointment {
  id: number;
  client_name: string;
  services: { name: string; price: number }[];
  appointment_date: string;
  status: string;
  total_price: number;
  notes?: string;
}

type ViewMode = 'month' | 'week' | 'day' | 'timeline';

export default function BarberSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/appointments/barber-appointments`,
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/appointments/${appointmentId}/status-simple`,
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
        loadAppointments(token!);
        toast.success(`Status atualizado!`);
      } else {
        toast.error('Erro ao atualizar status');
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
      case 'PENDING':
        return { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-500' };
      case 'CONFIRMED':
        return { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500' };
      case 'IN_PROGRESS':
        return { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500' };
      case 'COMPLETED':
        return { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-500' };
      case 'CANCELLED':
        return { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-500' };
      default:
        return { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-500' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pendente';
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

  // Funções de calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  const getAppointmentsForSelectedDay = () => {
    if (!selectedDate) return [];
    return getAppointmentsForDay(selectedDate);
  };

  const hasAppointments = (date: Date | null) => {
    return getAppointmentsForDay(date).length > 0;
  };

  const getAppointmentCount = (date: Date | null) => {
    return getAppointmentsForDay(date).length;
  };

  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const isSameMonth = 
      aptDate.getMonth() === currentMonth.getMonth() &&
      aptDate.getFullYear() === currentMonth.getFullYear();
    
    const statusMatch = filterStatus === 'all' || apt.status.toUpperCase() === filterStatus.toUpperCase();
    return isSameMonth && statusMatch;
  });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentMonth);
    startOfWeek.setDate(currentMonth.getDate() - currentMonth.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getAppointmentAtTime = (timeSlot: string, date: Date) => {
    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return appointments.find(apt => {
      const aptTime = new Date(apt.appointment_date);
      return aptTime >= slotStart && aptTime < slotEnd;
    });
  };

  const days = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Carregando agenda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/barber/dashboard" className="text-white hover:text-blue-400 transition-colors text-sm sm:text-base">
                ← Voltar
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-white">📅 <span className="hidden sm:inline">Minha </span>Agenda</h1>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Controles */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-700 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Navegação de Data */}
            <div className="flex items-center space-x-2 sm:space-x-3 w-full lg:w-auto">
              <button
                onClick={previousMonth}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 sm:px-4 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
              >
                ←
              </button>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white flex-1 text-center">
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </h2>
              <button
                onClick={nextMonth}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 sm:px-4 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
              >
                →
              </button>
              <button
                onClick={goToToday}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 rounded-lg transition-colors text-sm sm:text-base min-h-[44px] whitespace-nowrap"
              >
                Hoje
              </button>
            </div>

            {/* Filtros e Visualizações */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] text-sm sm:text-base"
              >
                <option value="all">Todos Status</option>
                <option value="PENDING">Pendente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
              </select>

              <div className="flex bg-gray-700 rounded-lg p-1 overflow-x-auto">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-2 sm:px-4 rounded-md transition-colors whitespace-nowrap min-h-[44px] text-sm sm:text-base ${
                    viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">📅</span>
                  <span className="hidden sm:inline">📅 Mês</span>
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-2 sm:px-4 rounded-md transition-colors whitespace-nowrap min-h-[44px] text-sm sm:text-base ${
                    viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">📆</span>
                  <span className="hidden sm:inline">📆 Semana</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('day');
                    if (!selectedDate) setSelectedDate(new Date());
                  }}
                  className={`px-3 py-2 sm:px-4 rounded-md transition-colors whitespace-nowrap min-h-[44px] text-sm sm:text-base ${
                    viewMode === 'day' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">📋</span>
                  <span className="hidden sm:inline">📋 Dia</span>
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-2 sm:px-4 rounded-md transition-colors whitespace-nowrap min-h-[44px] text-sm sm:text-base ${
                    viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">⏱️</span>
                  <span className="hidden sm:inline">⏱️ Timeline</span>
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total do Mês</p>
              <p className="text-xl sm:text-3xl font-bold text-white">{monthlyAppointments.length}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Concluídos</p>
              <p className="text-xl sm:text-3xl font-bold text-green-400">
                {monthlyAppointments.filter(apt => apt.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Pendentes</p>
              <p className="text-xl sm:text-3xl font-bold text-yellow-400">
                {monthlyAppointments.filter(apt => apt.status === 'PENDING' || apt.status === 'CONFIRMED').length}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Receita</p>
              <p className="text-lg sm:text-3xl font-bold text-green-400">
                R$ {monthlyAppointments.filter(apt => apt.status === 'COMPLETED').reduce((sum, apt) => sum + (apt.total_price || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Vista de Calendário Mensal */}
        {viewMode === 'month' && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-x-auto shadow-xl">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-7 bg-gray-700/50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 sm:p-4 text-center font-semibold text-gray-300 border-r border-gray-600 last:border-r-0 text-xs sm:text-base">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.substr(0, 1)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((date, index) => {
                const dayAppointments = getAppointmentsForDay(date);
                const isToday = date && date.toDateString() === new Date().toDateString();
                const hasApts = hasAppointments(date);
                const aptCount = getAppointmentCount(date);

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (date) {
                        setSelectedDate(date);
                        setViewMode('day');
                      }
                    }}
                    className={`min-h-[80px] sm:min-h-[120px] md:min-h-[140px] p-1 sm:p-2 md:p-3 border-r border-b border-gray-700 cursor-pointer transition-all ${
                      !date ? 'bg-gray-900/50' : 
                      hasApts ? 'bg-blue-900/20 hover:bg-blue-900/30' : 
                      'bg-gray-800/50 hover:bg-gray-750'
                    } ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800' : ''}`}
                  >
                    {date && (
                      <>
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <span className={`text-sm sm:text-base md:text-lg font-bold ${
                            isToday ? 'text-blue-400' : hasApts ? 'text-white' : 'text-gray-400'
                          }`}>
                            {date.getDate()}
                          </span>
                          {hasApts && (
                            <span className={`${getStatusColor(dayAppointments[0]?.status || 'PENDING').bg} text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[20px] sm:min-w-[24px] text-center`}>
                              {aptCount}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-0.5 sm:space-y-1">
                          {dayAppointments.slice(0, 2).map(apt => {
                            const colors = getStatusColor(apt.status);
                            return (
                              <div
                                key={apt.id}
                                className={`text-[10px] sm:text-xs p-1 sm:p-1.5 rounded ${colors.bg} text-white truncate hover:opacity-90 transition-opacity`}
                                title={`${apt.client_name} - ${new Date(apt.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                              >
                                <div className="font-semibold hidden sm:block">{new Date(apt.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                <div className="truncate">{apt.client_name}</div>
                              </div>
                            );
                          })}
                          {dayAppointments.length > 2 && (
                            <div className="text-[10px] sm:text-xs text-gray-400 text-center font-semibold">
                              +{dayAppointments.length - 2}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        )}

        {/* Vista de Semana */}
        {viewMode === 'week' && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-xl">
            <div className="grid grid-cols-8 bg-gray-700/50">
              <div className="p-4 border-r border-gray-600"></div>
              {getWeekDays().map((day) => {
                const isToday = day.toDateString() === new Date().toDateString();
                const dayApts = getAppointmentsForDay(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-4 text-center border-r border-gray-600 last:border-r-0 ${isToday ? 'bg-blue-600/30' : ''}`}
                  >
                    <div className="text-xs text-gray-400 mb-1">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>
                      {day.getDate()}
                    </div>
                    {dayApts.length > 0 && (
                      <div className="mt-1 text-xs text-blue-400 font-semibold">{dayApts.length} agendamentos</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-8">
              <div className="border-r border-gray-700">
                {getTimeSlots().map(slot => (
                  <div key={slot} className="h-16 border-b border-gray-700 p-2 text-xs text-gray-400">
                    {slot}
                  </div>
                ))}
              </div>
              {getWeekDays().map((day, dayIdx) => (
                <div key={dayIdx} className="border-r border-gray-700 last:border-r-0">
                  {getTimeSlots().map(slot => {
                    const apt = getAppointmentAtTime(slot, day);
                    return (
                      <div key={slot} className="h-16 border-b border-gray-700 p-1">
                        {apt && (
                          <div className={`${getStatusColor(apt.status).bg} text-white text-xs p-1 rounded h-full overflow-hidden`}>
                            <div className="font-semibold">{new Date(apt.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="truncate">{apt.client_name}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vista de Dia com Timeline */}
        {viewMode === 'day' && (
          <div className="space-y-6">
            {/* Seletor de Data */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <input
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Timeline do Dia */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">
                  {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase()) : 'Selecione uma data'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {getAppointmentsForSelectedDay().length} agendamento(s)
                </p>
              </div>

              {!selectedDate ? (
                <div className="p-12 text-center">
                  <div className="text-gray-600 text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    Selecione uma data
                  </h3>
                </div>
              ) : getAppointmentsForSelectedDay().length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-600 text-6xl mb-4">✨</div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    Nenhum agendamento para este dia
                  </h3>
                  <p className="text-gray-500">
                    Aproveite para descansar!
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Linha do Tempo */}
                  <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                  
                  {getTimeSlots().map((slot) => {
                    const apt = getAppointmentAtTime(slot, selectedDate!);
                    const isHour = slot.endsWith(':00');
                    
                    return (
                      <div key={slot} className="relative flex items-start p-4 hover:bg-gray-750/50 transition-colors">
                        {/* Marcador de Hora */}
                        <div className="w-16 text-right pr-4">
                          {isHour && (
                            <span className="text-sm font-semibold text-gray-400">{slot}</span>
                          )}
                        </div>
                        
                        {/* Linha Vertical */}
                        <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                        
                        {/* Ponto no Timeline */}
                        {apt && (
                          <div className={`absolute left-[60px] top-6 w-4 h-4 rounded-full ${getStatusColor(apt.status).bg} border-2 border-gray-800 z-10`}></div>
                        )}
                        
                        {/* Agendamento */}
                        {apt && (
                          <div className={`ml-8 flex-1 ${getStatusColor(apt.status).border} border-l-4 rounded-lg p-4 bg-gray-700/50`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-lg font-bold text-white">{apt.client_name}</span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(apt.status).bg}`}>
                                    {getStatusText(apt.status)}
                                  </span>
                                </div>
                                <div className="text-gray-300 text-sm mb-2">
                                  {new Date(apt.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-gray-400 text-sm mb-2">
                                  <strong>Serviços:</strong> {apt.services?.map(s => s.name).join(', ') || 'N/A'}
                                </div>
                                <div className="text-white font-semibold">
                                  R$ {apt.total_price?.toFixed(2) || '0.00'}
                                </div>
                                {apt.notes && (
                                  <div className="mt-2 text-gray-400 text-sm italic">
                                    &quot;{apt.notes}&quot;
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex flex-col space-y-2">
                                {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                                  <>
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'CONFIRMED')}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'COMPLETED')}
                                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                      Concluir
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'CANCELLED')}
                                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista de Timeline Geral */}
        {viewMode === 'timeline' && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Timeline de Agendamentos
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Todos os agendamentos em ordem cronológica
              </p>
            </div>

            {appointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-600 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Nenhum agendamento encontrado
                </h3>
              </div>
            ) : (
              <div className="relative p-6">
                {/* Linha do Tempo Vertical */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
                
                <div className="space-y-6">
                  {appointments
                    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                    .map((apt) => {
                      const aptDate = new Date(apt.appointment_date);
                      const colors = getStatusColor(apt.status);
                      
                      return (
                        <div key={apt.id} className="relative flex items-start">
                          {/* Ponto no Timeline */}
                          <div className={`absolute left-6 w-4 h-4 rounded-full ${colors.bg} border-4 border-gray-800 z-10`}></div>
                          
                          {/* Conteúdo */}
                          <div className={`ml-12 flex-1 ${colors.border} border-l-4 rounded-lg p-5 bg-gray-700/50 hover:bg-gray-700 transition-colors`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-xl font-bold text-white">{apt.client_name}</span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${colors.bg}`}>
                                    {getStatusText(apt.status)}
                                  </span>
                                </div>
                                <div className="text-gray-300 mb-2">
                                  <span className="font-semibold">{aptDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</span>
                                  {' às '}
                                  <span className="font-semibold">{aptDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <p className="text-gray-400 text-sm mb-1">Serviços:</p>
                                    <p className="text-white">{apt.services?.map(s => s.name).join(', ') || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-sm mb-1">Valor:</p>
                                    <p className="text-white font-bold text-lg">R$ {apt.total_price?.toFixed(2) || '0.00'}</p>
                                  </div>
                                </div>
                                {apt.notes && (
                                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                                    <p className="text-gray-400 text-sm mb-1">Observações:</p>
                                    <p className="text-white italic">{apt.notes}</p>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex flex-col space-y-2">
                                {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                                  <>
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'CONFIRMED')}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'COMPLETED')}
                                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                                    >
                                      Concluir
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'CANCELLED')}
                                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                                    >
                                      Cancelar
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
