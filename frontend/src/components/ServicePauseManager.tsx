'use client';

import { useState } from 'react';
import { PauseIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ServiceSession {
  id: string;
  appointment_id: string;
  service_id: string;
  barber_id: string;
  client_id: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'resumed' | 'completed' | 'cancelled';
  start_time?: string;
  pause_time?: string;
  resume_time?: string;
  end_time?: string;
  active_duration_minutes: number;
  pause_duration_minutes: number;
  total_duration_minutes: number;
  has_pause: boolean;
  expected_pause_minutes: number;
  notes?: string;
  is_paused: boolean;
  is_active: boolean;
  can_be_paused: boolean;
  can_be_resumed: boolean;
  can_be_completed: boolean;
}

interface ServicePauseManagerProps {
  session: ServiceSession;
  clientName: string;
  serviceName: string;
  onUpdate: () => void;
}

export default function ServicePauseManager({ 
  session, 
  clientName, 
  serviceName, 
  onUpdate 
}: ServicePauseManagerProps) {
  const [loading, setLoading] = useState(false);

  const handlePause = async () => {
    if (!session.can_be_paused) {
      toast.error('Serviço não pode ser pausado neste momento');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/service-sessions/${session.id}/pause`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Serviço pausado! Sua agenda está liberada para outros atendimentos.');
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao pausar serviço');
      }
    } catch (error) {
      console.error('Erro ao pausar serviço:', error);
      toast.error('Erro ao pausar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!session.can_be_resumed) {
      toast.error('Serviço não pode ser retomado neste momento');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/service-sessions/${session.id}/resume`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Serviço retomado! Continue o atendimento.');
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao retomar serviço');
      }
    } catch (error) {
      console.error('Erro ao retomar serviço:', error);
      toast.error('Erro ao retomar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!session.can_be_completed) {
      toast.error('Serviço não pode ser finalizado neste momento');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/service-sessions/${session.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Serviço finalizado com sucesso!');
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao finalizar serviço');
      }
    } catch (error) {
      console.error('Erro ao finalizar serviço:', error);
      toast.error('Erro ao finalizar serviço');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Em Andamento</span>;
      case 'paused':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Em Pausa</span>;
      case 'resumed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Retomado</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Finalizado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">{serviceName}</h4>
          <p className="text-xs text-gray-600 mt-1">Cliente: {clientName}</p>
        </div>
        {getStatusBadge()}
      </div>

      {session.has_pause && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <p className="font-medium">⚠️ Serviço com pausa</p>
          <p className="mt-1">Pausa esperada: {formatDuration(session.expected_pause_minutes)}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
        <div>
          <span className="font-medium">Tempo ativo:</span> {formatDuration(session.active_duration_minutes)}
        </div>
        {session.pause_duration_minutes > 0 && (
          <div>
            <span className="font-medium">Tempo em pausa:</span> {formatDuration(session.pause_duration_minutes)}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {session.can_be_paused && (
          <button
            onClick={handlePause}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            <PauseIcon className="h-4 w-4" />
            Pausar
          </button>
        )}

        {session.can_be_resumed && (
          <button
            onClick={handleResume}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <PlayIcon className="h-4 w-4" />
            Retomar
          </button>
        )}

        {session.can_be_completed && (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Finalizar
          </button>
        )}
      </div>

      {session.is_paused && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          <p className="font-medium">✅ Agenda liberada!</p>
          <p className="mt-1">Você pode atender outros clientes durante esta pausa.</p>
        </div>
      )}
    </div>
  );
}




