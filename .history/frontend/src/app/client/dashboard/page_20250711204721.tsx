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
        setAppointments(appointmentsData);
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
        setBarbers(barbersData);
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
        setServices(servicesData);
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
        setTimeSlots(data.slots);
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
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
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IconFallback type="barber-chair" size="lg" className="text-yellow-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-amber-900 to-yellow-800">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-500 p-2 rounded-full">
              <IconFallback type="barber-chair" size="md" className="text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Minha Área</h1>
              <p className="text-gray-300 text-sm">
                Olá, {user?.full_name || 'Cliente'}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBooking(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <IconFallback type="scissors" size="sm" className="mr-2 inline" />
              Novo Agendamento
            </button>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Próximo Agendamento</p>
                <p className="text-white text-lg font-bold">
                  {appointments.find(apt => new Date(apt.appointment_date) > new Date()) ? 
                    new Date(appointments.find(apt => new Date(apt.appointment_date) > new Date())!.appointment_date).toLocaleDateString('pt-BR') :
                    'Nenhum'
                  }
                </p>
              </div>
              <IconFallback type="barber-chair" size="lg" className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total de Cortes</p>
                <p className="text-white text-lg font-bold">{appointments.length}</p>
              </div>
              <IconFallback type="scissors" size="lg" className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Valor Total Gasto</p>
                <p className="text-white text-lg font-bold">
                  R$ {appointments.reduce((total, apt) => total + apt.total_price, 0).toFixed(2)}
                </p>
              </div>
              <IconFallback type="barber-pole" size="lg" className="text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Meus Agendamentos */}
        <div className="bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center">
              <IconFallback type="barber-chair" size="md" className="mr-2 text-yellow-500" />
              Meus Agendamentos
            </h2>
          </div>

          <div className="overflow-x-auto">
            {appointments.length === 0 ? (
              <div className="p-12 text-center">
                <IconFallback type="barber-chair" size="lg" className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Nenhum agendamento ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Que tal agendar seu primeiro corte?
                </p>
                <button
                  onClick={() => setShowBooking(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Agendar Agora
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {appointments
                  .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
                  .map((appointment) => (
                    <div key={appointment.id} className="p-6 hover:bg-gray-750 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                            <span className="text-white font-semibold">
                              {appointment.barber_name}
                            </span>
                            <span className="text-gray-300 text-sm">
                              {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {' '}
                              {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          <div className="text-gray-300 text-sm">
                            <p>Serviços: {appointment.services?.map(s => s.name).join(', ') || 'N/A'}</p>
                            <p className="text-yellow-400 font-semibold">
                              Valor: R$ {appointment.total_price.toFixed(2)}
                            </p>
                            {appointment.notes && (
                              <p className="text-gray-400 mt-1">Obs: {appointment.notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2">
                          {['scheduled', 'confirmed'].includes(appointment.status) && 
                           new Date(appointment.appointment_date) > new Date() && (
                            <button
                              onClick={() => cancelAppointment(appointment.id)}
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
      </div>

      {/* Modal de Agendamento */}
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <IconFallback type="scissors" size="md" className="mr-2 text-yellow-500" />
                  Novo Agendamento
                </h2>
                <button
                  onClick={() => setShowBooking(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Escolher Barbeiro */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Escolha o Barbeiro
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {barbers.map((barber) => (
                    <button
                      key={barber.id}
                      onClick={() => setSelectedBarber(barber.id)}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedBarber === barber.id
                          ? 'border-yellow-500 bg-yellow-500 bg-opacity-20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-600 p-2 rounded-full">
                          <IconFallback type="scissors" size="sm" className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{barber.name}</p>
                          <p className="text-gray-400 text-sm">
                            {barber.specialties?.join(', ') || 'Especialista em cortes'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Escolher Serviços */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Escolha os Serviços
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        if (selectedServices.includes(service.id)) {
                          setSelectedServices(selectedServices.filter(id => id !== service.id));
                        } else {
                          setSelectedServices([...selectedServices, service.id]);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedServices.includes(service.id)
                          ? 'border-yellow-500 bg-yellow-500 bg-opacity-20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{service.name}</p>
                          <p className="text-gray-400 text-sm">{service.description}</p>
                          <p className="text-gray-300 text-sm">{service.duration_minutes} min</p>
                        </div>
                        <div className="text-yellow-400 font-bold">
                          R$ {service.price.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
                    <p className="text-yellow-400 font-semibold">
                      Total: R$ {getTotalPrice().toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Escolher Data */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Escolha a Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                />
              </div>

              {/* Escolher Horário */}
              {selectedBarber && selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Escolha o Horário
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-2 rounded text-sm transition-colors ${
                          !slot.available
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : selectedTime === slot.time
                            ? 'bg-yellow-500 text-black'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma preferência especial?"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 h-20 resize-none"
                />
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowBooking(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createAppointment}
                  disabled={bookingLoading || !selectedBarber || selectedServices.length === 0 || !selectedDate || !selectedTime}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-lg transition-colors flex items-center"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
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