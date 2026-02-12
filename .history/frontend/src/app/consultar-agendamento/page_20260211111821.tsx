'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, CalendarIcon, ClockIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface AppointmentDetails {
  id: string;
  appointment_code: string;
  client_name: string;
  barber_name: string;
  appointment_date: string;
  formatted_date: string;
  total_amount: number;
  duration_minutes: number;
  status: string;
  notes?: string;
  can_cancel: boolean;
}

export default function ConsultarAgendamento() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Por favor, digite o código do agendamento');
      return;
    }

    setLoading(true);
    setError('');
    setAppointment(null);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/appointments/by-code/${code.trim().toUpperCase()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Agendamento não encontrado. Verifique o código e tente novamente.');
        } else {
          setError('Erro ao buscar agendamento. Tente novamente.');
        }
        return;
      }

      const data = await response.json();
      setAppointment(data);
    } catch (err) {
      console.error('Erro ao consultar agendamento:', err);
      setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-500/20 text-green-400 border-green-400';
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
      case 'cancelado':
        return 'bg-red-500/20 text-red-400 border-red-400';
      case 'concluido':
        return 'bg-blue-500/20 text-blue-400 border-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
            Consultar Agendamento
          </h1>
          <p className="text-purple-200 text-center">
            Digite o código do seu agendamento para ver os detalhes
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-white font-semibold mb-2">
                Código do Agendamento
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Digite o código (ex: ABC123)"
                  className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Consultar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Appointment Details */}
        {appointment && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Detalhes do Agendamento
                  </h2>
                  <p className="text-purple-200">
                    Código: <span className="font-mono font-bold">{appointment.appointment_code}</span>
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-lg border font-semibold ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-6">
              {/* Cliente */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <UserIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Cliente</h3>
                  <p className="text-gray-300">{appointment.client_name}</p>
                </div>
              </div>

              {/* Barbeiro */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <UserIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Barbeiro</h3>
                  <p className="text-gray-300">{appointment.barber_name}</p>
                </div>
              </div>

              {/* Data e Hora */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Data e Hora</h3>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-300">{appointment.formatted_date}</p>
                  </div>
                </div>
              </div>

              {/* Duração */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Duração</h3>
                  <p className="text-gray-300">{appointment.duration_minutes} minutos</p>
                </div>
              </div>

              {/* Valor Total */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-lg">Valor Total</span>
                  <span className="text-2xl font-bold text-green-400">
                    R$ {appointment.total_amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {/* Observações */}
              {appointment.notes && (
                <div className="bg-gray-800/30 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Observações</h3>
                  <p className="text-gray-300">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        {!appointment && !error && !loading && (
          <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-2">💡 Dica</h3>
            <p className="text-blue-200 text-sm">
              O código do agendamento foi enviado para você no momento da confirmação. 
              Verifique seu e-mail ou mensagem de confirmação.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
amount