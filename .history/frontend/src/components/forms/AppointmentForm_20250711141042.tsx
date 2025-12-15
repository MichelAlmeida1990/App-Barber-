'use client';

import { useState, useEffect } from 'react';
import { appointmentsAPI, barbersAPI, servicesAPI, clientsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AppointmentFormProps {
  onSuccess: (appointment: any) => void;
  onCancel: () => void;
}

export default function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    barberId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });

  // Mock data - em produção, carregue da API
  const mockBarbers = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Carlos Santos' },
    { id: '3', name: 'Pedro Oliveira' }
  ];

  const mockServices = [
    { id: '1', name: 'Corte Masculino', price: 30, duration: 30 },
    { id: '2', name: 'Barba', price: 20, duration: 20 },
    { id: '3', name: 'Combo Completo', price: 45, duration: 45 },
    { id: '4', name: 'Sobrancelha', price: 15, duration: 15 },
    { id: '5', name: 'Hidratação', price: 25, duration: 25 },
    { id: '6', name: 'Tratamento Premium', price: 80, duration: 60 }
  ];

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
    
    if (!formData.clientName || !formData.clientPhone || !formData.barberId || !formData.serviceId || !formData.date || !formData.time) {
      toast.error('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    setLoading(true);
    try {
      const selectedService = mockServices.find(s => s.id === formData.serviceId);
      const selectedBarber = mockBarbers.find(b => b.id === formData.barberId);

      const newAppointment = {
        id: Date.now().toString(),
        clientName: formData.clientName,
        phone: formData.clientPhone,
        barberName: selectedBarber?.name || '',
        service: selectedService?.name || '',
        date: formData.date,
        time: formData.time,
        duration: selectedService?.duration || 30,
        price: selectedService?.price || 0,
        status: 'pendente',
        notes: formData.notes
      };

      // await appointmentsAPI.create(newAppointment);
      toast.success('Agendamento criado com sucesso!');
      onSuccess(newAppointment);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = mockServices.find(s => s.id === formData.serviceId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
            Nome do Cliente *
          </label>
          <input
            type="text"
            name="clientName"
            id="clientName"
            required
            value={formData.clientName}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Nome completo do cliente"
          />
        </div>

        <div>
          <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">
            Telefone do Cliente *
          </label>
          <input
            type="tel"
            name="clientPhone"
            id="clientPhone"
            required
            value={formData.clientPhone}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="(11) 99999-9999"
          />
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
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Selecione um barbeiro</option>
            {mockBarbers.map(barber => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
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
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Selecione um serviço</option>
            {mockServices.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - R$ {service.price} ({service.duration}min)
              </option>
            ))}
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
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          <h4 className="text-sm font-medium text-blue-900">Resumo do Serviço:</h4>
          <p className="text-sm text-blue-700">
            {selectedService.name} - R$ {selectedService.price} - Duração: {selectedService.duration} minutos
          </p>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Observações especiais para o agendamento..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando...' : 'Criar Agendamento'}
        </button>
      </div>
    </form>
  );
} 