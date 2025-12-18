'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { generateId } from '@/lib/utils';

interface AppointmentFormProps {
  onSuccess: (appointment: any) => void;
  onCancel: () => void;
  onGoToClientCadastro?: () => void;
  initialData?: any;
}

type StoredClient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: 'ativo' | 'inativo';
};

const ADMIN_CLIENTS_LS_KEY = 'admin_clients_v1';

export default function AppointmentForm({ onSuccess, onCancel, onGoToClientCadastro, initialData }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<StoredClient[]>([]);
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || '',
    barberId: initialData?.barberId || '',
    serviceId: initialData?.serviceId || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    notes: initialData?.notes || ''
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_CLIENTS_LS_KEY);
      if (!raw) {
        setClients([]);
        return;
      }
      const parsed = JSON.parse(raw) as StoredClient[];
      if (!Array.isArray(parsed)) {
        setClients([]);
        return;
      }
      const active = parsed.filter((c) => (c.status ? c.status === 'ativo' : true));
      setClients(active);
    } catch (e) {
      console.warn('Falha ao ler clientes do localStorage:', e);
      setClients([]);
    }
  }, []);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === formData.clientId),
    [clients, formData.clientId]
  );

  const ADMIN_BARBERS_LS_KEY = 'admin_barbers_v1';
  const ADMIN_SERVICES_LS_KEY = 'admin_services_v1';

  const [barbers, setBarbers] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; price: number; duration: number }[]>([]);

  const loadBarbers = () => {
    try {
      const barbersRaw = localStorage.getItem(ADMIN_BARBERS_LS_KEY);
      if (barbersRaw) {
        const parsed = JSON.parse(barbersRaw) as any[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeBarbers = parsed
            .filter(b => b.active !== false)
            .map(b => ({ id: String(b.id), name: String(b.name || '') }))
            .filter(b => b.id && b.name);
          setBarbers(activeBarbers);
        }
      }
    } catch (e) {
      console.warn('Falha ao ler barbeiros do localStorage:', e);
    }
  };

  const loadServices = () => {
    try {
      const servicesRaw = localStorage.getItem(ADMIN_SERVICES_LS_KEY);
      if (servicesRaw) {
        const parsed = JSON.parse(servicesRaw) as any[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeServices = parsed
            .filter(s => s.active !== false)
            .map(s => ({
              id: String(s.id),
              name: String(s.name || ''),
              price: Number(s.price || 0),
              duration: Number(s.duration || 30)
            }))
            .filter(s => s.id && s.name);
          setServices(activeServices);
        }
      }
    } catch (e) {
      console.warn('Falha ao ler serviços do localStorage:', e);
    }
  };

  useEffect(() => {
    // Carregar dados iniciais
    loadBarbers();
    loadServices();

    // Listener para mudanças no localStorage (de outras abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ADMIN_BARBERS_LS_KEY) {
        loadBarbers();
      } else if (e.key === ADMIN_SERVICES_LS_KEY) {
        loadServices();
      }
    };

    // Listener customizado para mudanças na mesma aba
    const handleBarbersUpdate = () => loadBarbers();
    const handleServicesUpdate = () => loadServices();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin_barbers_updated', handleBarbersUpdate);
    window.addEventListener('admin_services_updated', handleServicesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin_barbers_updated', handleBarbersUpdate);
      window.removeEventListener('admin_services_updated', handleServicesUpdate);
    };
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clients.length === 0) {
      toast.error('Cadastre um cliente antes de agendar');
      return;
    }

    if (!formData.clientId || !formData.barberId || !formData.serviceId || !formData.date || !formData.time) {
      toast.error('Selecione o cliente e preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const selectedService = services.find(s => s.id === formData.serviceId);
      const selectedBarber = barbers.find(b => b.id === formData.barberId);

      const newAppointment = {
        id: initialData?.id || generateId('appointment'),
        clientId: formData.clientId,
        clientName: selectedClient?.name || '',
        phone: selectedClient?.phone || '',
        barberName: selectedBarber?.name || '',
        service: selectedService?.name || '',
        barberId: formData.barberId,
        serviceId: formData.serviceId,
        date: formData.date,
        time: formData.time,
        duration: selectedService?.duration || 30,
        price: selectedService?.price || 0,
        status: 'pendente',
        notes: formData.notes
      };

      // await.create(newAppointment);
      toast.success('Agendamento criado com sucesso!');
      onSuccess(newAppointment);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {clients.length === 0 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Para criar um agendamento, primeiro você precisa <b>cadastrar um cliente</b>.
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                onCancel();
                onGoToClientCadastro?.();
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              Ir para cadastro de cliente
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Cliente *
          </label>
          <select
            name="clientId"
            id="clientId"
            required
            value={formData.clientId}
            onChange={handleInputChange}
            disabled={clients.length === 0}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione um cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.phone ? ` — ${c.phone}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <div className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700">
            {selectedClient?.phone || '—'}
          </div>
        </div>

        <div>
          <label htmlFor="barberId" className="block text-sm font-medium text-gray-700">
            Barbeiro *
          </label>
          <select
            name="barberId"
            id="barberId"
            required
            value={formData.barberId}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione um barbeiro</option>
            {barbers.length > 0 ? (
              barbers.map(barber => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))
            ) : (
              <option value="" disabled>Nenhum barbeiro cadastrado</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">
            Serviço *
          </label>
          <select
            name="serviceId"
            id="serviceId"
            required
            value={formData.serviceId}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione um serviço</option>
            {services.length > 0 ? (
              services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                </option>
              ))
            ) : (
              <option value="" disabled>Nenhum serviço cadastrado</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Data *
          </label>
          <input
            type="date"
            name="date"
            id="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={formData.date}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Horário *
          </label>
          <select
            name="time"
            id="time"
            required
            value={formData.time}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione um horário</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedService && (
        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="text-xs sm:text-sm font-medium text-blue-900">Resumo do Serviço:</h4>
          <p className="text-xs sm:text-sm text-blue-700 break-words">
            {selectedService.name} - R$ {selectedService.price} - Duração: {selectedService.duration} minutos
          </p>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Observações especiais para o agendamento..."
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3 pt-3 sm:pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando...' : 'Criar Agendamento'}
        </button>
      </div>
    </form>
  );
} 