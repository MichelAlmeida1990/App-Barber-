'use client';

import { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

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
  category: string;
}

interface BookingWizardProps {
  barbers: Barber[];
  services: Service[];
  onClose: () => void;
  onComplete: (code: string) => void;
}

export default function BookingWizard({ barbers, services, onClose, onComplete }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  const steps = [
    { number: 1, title: 'Barbeiro', icon: UserIcon },
    { number: 2, title: 'Serviços', icon: CheckCircleIcon },
    { number: 3, title: 'Data', icon: CalendarIcon },
    { number: 4, title: 'Horário', icon: ClockIcon },
    { number: 5, title: 'Confirmar', icon: CurrencyDollarIcon },
  ];

  // Calcular totais
  const selectedServicesData = services.filter(s => selectedServices.includes(s.id));
  const totalPrice = selectedServicesData.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServicesData.reduce((sum, s) => sum + s.duration_minutes, 0);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedBarber !== null;
      case 2: return selectedServices.length > 0;
      case 3: return selectedDate !== '';
      case 4: return selectedTime !== '';
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const selectedBarberData = barbers.find(b => b.id === selectedBarber);
  const [loading, setLoading] = useState(false);

  const handleConfirmBooking = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Você precisa estar logado para criar um agendamento.');
        return;
      }

      // Formatar data e hora corretamente
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
      
      console.log('Criando agendamento...', {
        barber_id: selectedBarber,
        service_ids: selectedServices,
        appointment_date: appointmentDateTime,
        notes: notes || ''
      });

      const requestBody = {
        barber_id: selectedBarber,
        service_ids: selectedServices,
        appointment_date: appointmentDateTime,
        notes: notes || ''
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/appointments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      }).catch((fetchError) => {
        console.error('Erro na requisição fetch:', fetchError);
        throw new Error(`Erro de conexão: ${fetchError.message}. Verifique se o servidor está rodando.`);
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          errorMessage = errorData?.detail || errorData?.message || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        alert(`Erro ao criar agendamento: ${errorMessage}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.appointment_code) {
        onComplete(data.appointment_code);
      } else {
        console.warn('Resposta sem appointment_code:', data);
        alert('Erro: Código de agendamento não foi retornado.');
      }
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao criar agendamento';
      alert(`Erro ao criar agendamento: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-3 sm:p-6 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-2xl font-bold text-white">Novo Agendamento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl p-2 hover:bg-gray-800 rounded-lg transition-all min-h-[44px] min-w-[44px]"
          >
            ✕
          </button>
        </div>

        <div className="p-3 sm:p-6">
      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1 min-w-[60px] sm:min-w-[80px]">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  currentStep >= step.number 
                    ? 'bg-yellow-400 border-yellow-400 text-black' 
                    : 'bg-gray-700 border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center ${
                  currentStep >= step.number ? 'text-yellow-400' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 sm:mx-2 transition-all ${
                  currentStep > step.number ? 'bg-yellow-400' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-6 min-h-[400px] sm:min-h-[500px]">
        {/* Step 1: Barbeiro */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">Escolha seu Barbeiro</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {barbers.map(barber => (
                <button
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber.id)}
                  className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-left min-h-[80px] ${
                    selectedBarber === barber.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-750'
                  }`}
                >
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-black">
                      {barber.name.charAt(0)}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{barber.name}</h3>
                  <div className="flex items-center text-yellow-400 text-sm mb-2">
                    ⭐ {barber.rating.toFixed(1)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {barber.specialties.map((specialty, idx) => (
                      <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Serviços */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Escolha os Serviços</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleServiceToggle(service.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedServices.includes(service.id)
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                    {selectedServices.includes(service.id) && (
                      <CheckCircleIcon className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-bold text-lg">
                      {formatCurrency(service.price)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {service.duration_minutes} min
                    </span>
                  </div>
                  <span className="inline-block mt-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {service.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Data (placeholder - será implementado) */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Escolha a Data</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 text-lg"
            />
          </div>
        )}

        {/* Step 4: Horário (placeholder) */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Escolha o Horário</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                    selectedTime === time
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-750 text-white'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Confirmação */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Confirmar Agendamento</h2>
            <div className="space-y-4">
              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="text-sm text-gray-400 mb-1">Barbeiro</h3>
                <p className="text-lg font-semibold text-white">{selectedBarberData?.name}</p>
              </div>
              
              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="text-sm text-gray-400 mb-2">Serviços</h3>
                {selectedServicesData.map(service => (
                  <div key={service.id} className="flex justify-between items-center mb-1">
                    <span className="text-white">{service.name}</span>
                    <span className="text-yellow-400 font-semibold">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="text-sm text-gray-400 mb-1">Data e Horário</h3>
                <p className="text-lg font-semibold text-white">
                  {new Date(selectedDate).toLocaleDateString('pt-BR')} às {selectedTime}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Duração estimada: {totalDuration} minutos
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-black">Total</span>
                  <span className="text-2xl font-bold text-black">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Observações (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma preferência ou observação?"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 gap-2">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center px-4 sm:px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] text-sm sm:text-base"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Voltar</span>
          <span className="sm:hidden">←</span>
        </button>

        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center px-4 sm:px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Próximo</span>
            <span className="sm:hidden">→</span>
            <ChevronRightIcon className="w-5 h-5 ml-1 sm:ml-2" />
          </button>
        ) : (
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="flex items-center px-4 sm:px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                Agendando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Confirmar Agendamento</span>
                <span className="sm:hidden">Confirmar</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Preview Footer */}
      {currentStep >= 2 && currentStep < 5 && selectedServices.length > 0 && (
        <div className="mt-4 bg-gray-800 rounded-lg p-3 sm:p-4 border-2 border-yellow-400/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-gray-400">
              {selectedServices.length} serviço(s) • {totalDuration} min
            </span>
            <span className="text-yellow-400 font-bold text-base sm:text-lg">
              Total: {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      )}
      </div>
    </div>
    </div>
  );
}

