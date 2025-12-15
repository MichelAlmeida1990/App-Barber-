'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconFallback } from '@/components/IconFallback';

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

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  
  // Booking form state
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação
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
        console.log('Appointments data:', appointmentsData);
        setAppointments(appointmentsData);
      } else {
        console.error('Erro ao carregar agendamentos:', appointmentsResponse.status);
      }

      // Carregar barbeiros
      const barbersResponse = await fetch(
        'http://localhost:8000/api/v1/barbers/',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (barbersResponse.ok) {
        const barbersData = await barbersResponse.json();
        console.log('Barbers data:', barbersData);
        // Corrigir: acessar o array de barbeiros dentro da resposta
        setBarbers(barbersData.barbers || []);
      } else {
        console.error('Erro ao carregar barbeiros:', barbersResponse.status);
      }

      // Carregar serviços
      const servicesResponse = await fetch(
        'http://localhost:8000/api/v1/services/',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        console.log('Services data:', servicesData);
        // Corrigir: acessar o array de serviços dentro da resposta
        setServices(servicesData.services || []);
      } else {
        console.error('Erro ao carregar serviços:', servicesResponse.status);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (barberId: number, date: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/appointments/availability?barber_id=${barberId}&date=${date}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Time slots data:', data);
        // Corrigir: acessar o array de slots dentro da resposta
        setTimeSlots(data.slots || []);
      } else {
        console.error('Erro ao carregar horários:', response.status);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setTimeSlots([]);
    }
  };

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      loadTimeSlots(selectedBarber, selectedDate);
    }
  }, [selectedBarber, selectedDate]);

  const createAppointment = async () => {
    if (!selectedBarber || selectedServices.length === 0 || !selectedDate || !selectedTime) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setBookingLoading(true);
    const token = localStorage.getItem('token');

    try {
      const appointmentDate = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const response = await fetch('http://localhost:8000/api/v1/appointments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          barber_id: selectedBarber,
          service_ids: selectedServices,
          appointment_date: appointmentDate.toISOString(),
          notes: notes || null
        })
      });

      if (response.ok) {
        alert('Agendamento criado com sucesso!');
        setShowBooking(false);
        // Reset form
        setSelectedBarber(null);
        setSelectedServices([]);
        setSelectedDate('');
        setSelectedTime('');
        setNotes('');
        // Reload data
        loadDashboardData(token!);
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.detail}`);
      }
    } catch (error) {
      alert('Erro ao criar agendamento');
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: number) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        alert('Agendamento cancelado com sucesso!');
        loadDashboardData(token!);
      }
    } catch (error) {
      alert('Erro ao cancelar agendamento');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/client/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'confirmed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-500';
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
      default: return status;
    }
  };

  const getTotalPrice = () => {
    if (!services || services.length === 0) return 0;
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-2xl mb-4 inline-block">
            <IconFallback type="barber-chair" size="lg" className="text-white animate-pulse" />
          </div>
          <p className="text-white text-lg">Carregando sua área...</p>
          <div className="mt-4 w-64 mx-auto bg-white/20 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <IconFallback type="barber-chair" size="md" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Minha Área</h1>
              <p className="text-blue-200">
                Olá, {user?.full_name || 'Cliente'}! ✨
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBooking(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <IconFallback type="scissors" size="sm" className="mr-2" />
              Novo Agendamento
            </button>
            <button
              onClick={logout}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 hover:text-red-200 px-4 py-3 rounded-xl transition-all duration-200"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Próximo Agendamento</p>
                <p className="text-white text-xl font-bold mt-1">
                  {appointments && appointments.length > 0 && appointments.find(apt => new Date(apt.appointment_date) > new Date()) ? 
                    new Date(appointments.find(apt => new Date(apt.appointment_date) > new Date())!.appointment_date).toLocaleDateString('pt-BR') :
                    'Nenhum'
                  }
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <IconFallback type="barber-chair" size="lg" className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total de Cortes</p>
                <p className="text-white text-xl font-bold mt-1">{appointments ? appointments.length : 0}</p>
              </div>
              <div className="bg-indigo-500/20 p-3 rounded-xl">
                <IconFallback type="scissors" size="lg" className="text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Valor Total Gasto</p>
                <p className="text-white text-xl font-bold mt-1">
                  R$ {appointments ? appointments.reduce((total, apt) => total + apt.total_price, 0).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <IconFallback type="barber-pole" size="lg" className="text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Meus Agendamentos */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden mb-8">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <IconFallback type="barber-chair" size="md" className="mr-3 text-blue-400" />
              Meus Agendamentos
            </h2>
          </div>

          <div className="overflow-x-auto">
            {!appointments || appointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-blue-500/20 p-6 rounded-2xl mb-4 inline-block">
                  <IconFallback type="barber-chair" size="lg" className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhum agendamento ainda
                </h3>
                <p className="text-blue-200 mb-6">
                  Que tal agendar seu primeiro corte? É rápido e fácil!
                </p>
                <button
                  onClick={() => setShowBooking(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <IconFallback type="scissors" size="sm" className="mr-2 inline" />
                  Agendar Agora
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {appointments
                  .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
                  .map((appointment) => (
                    <div key={appointment.id} className="p-6 hover:bg-white/5 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                            <span className="text-white font-semibold text-lg">
                              {appointment.barber_name}
                            </span>
                            <span className="text-blue-200 text-sm bg-white/10 px-3 py-1 rounded-full">
                              {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {' '}
                              {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs text-white font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          <div className="text-blue-200 text-sm space-y-1">
                            <p>Serviços: {appointment.services?.map(s => s.name).join(', ') || 'N/A'}</p>
                            <p className="text-blue-300 font-semibold text-base">
                              💰 R$ {appointment.total_price.toFixed(2)}
                            </p>
                            {appointment.notes && (
                              <p className="text-white/60 mt-2 italic">📝 {appointment.notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-3">
                          {['scheduled', 'confirmed'].includes(appointment.status) && 
                           new Date(appointment.appointment_date) > new Date() && (
                            <button
                              onClick={() => cancelAppointment(appointment.id)}
                              className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg text-sm transition-all duration-200"
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

      {/* Modal de Agendamento */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <IconFallback type="scissors" size="md" className="mr-3 text-blue-400" />
                  Novo Agendamento
                </h2>
                <button
                  onClick={() => setShowBooking(false)}
                  className="text-white/60 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Escolher Barbeiro */}
              <div>
                <label className="block text-lg font-medium text-white mb-4">
                  Escolha o Barbeiro
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {barbers && barbers.length > 0 ? (
                    barbers.map((barber) => (
                      <button
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber.id)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                          selectedBarber === barber.id
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl">
                            <IconFallback type="scissors" size="md" className="text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-lg">{barber.name}</p>
                            <p className="text-blue-200 text-sm">
                              {barber.specialties?.join(', ') || 'Especialista em cortes modernos'}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-blue-200 text-sm ml-1">{barber.rating || '5.0'}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/20">
                      <IconFallback type="scissors" size="lg" className="text-blue-400 mb-4" />
                      <p className="text-white font-medium">Carregando barbeiros...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Escolher Serviços */}
              <div>
                <label className="block text-lg font-medium text-white mb-4">
                  Escolha os Serviços
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {services && services.length > 0 ? (
                    services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          if (selectedServices.includes(service.id)) {
                            setSelectedServices(selectedServices.filter(id => id !== service.id));
                          } else {
                            setSelectedServices([...selectedServices, service.id]);
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                          selectedServices.includes(service.id)
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold text-lg">{service.name}</p>
                            <p className="text-blue-200 text-sm">{service.description}</p>
                            <p className="text-blue-300 text-sm mt-1">⏱️ {service.duration_minutes} min</p>
                          </div>
                          <div className="text-blue-300 font-bold text-lg">
                            R$ {service.price.toFixed(2)}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/20">
                      <IconFallback type="barber-chair" size="lg" className="text-blue-400 mb-4" />
                      <p className="text-white font-medium">Carregando serviços...</p>
                    </div>
                  )}
                </div>
                {selectedServices.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-500/20 rounded-2xl border border-blue-500/50">
                    <p className="text-blue-300 font-semibold text-lg">
                      💰 Total: R$ {getTotalPrice().toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Escolher Data */}
              <div>
                <label className="block text-lg font-medium text-white mb-4">
                  Escolha a Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Escolher Horário */}
              {selectedBarber && selectedDate && (
                <div>
                  <label className="block text-lg font-medium text-white mb-4">
                    Escolha o Horário
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {timeSlots && timeSlots.length > 0 ? (
                      timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            !slot.available
                              ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                              : selectedTime === slot.time
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-blue-400'
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-4 p-4 text-center bg-white/5 rounded-xl border border-white/20">
                        <p className="text-white/60">Carregando horários disponíveis...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-lg font-medium text-white mb-4">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma preferência especial? Conte para o barbeiro..."
                  className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-white/50"
                />
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowBooking(false)}
                  className="px-6 py-3 text-white/70 hover:text-white transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={createAppointment}
                  disabled={bookingLoading || !selectedBarber || selectedServices.length === 0 || !selectedDate || !selectedTime}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Agendando...
                    </>
                  ) : (
                    <>
                      <IconFallback type="barber-chair" size="sm" className="mr-2" />
                      Confirmar Agendamento
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 