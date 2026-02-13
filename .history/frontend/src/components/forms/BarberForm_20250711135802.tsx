'use client';

import { useState } from 'react';
import { barbersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface BarberFormProps {
  onSuccess: (barber: any) => void;
  onCancel: () => void;
}

export default function BarberForm({ onSuccess, onCancel }: BarberFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '',
    commission: 35,
    schedule: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commission' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.specialty) {
      toast.error('Nome, telefone e especialidade são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const newBarber = {
        id: Date.now().toString(),
        ...formData,
        rating: 5.0,
        totalCuts: 0,
        status: 'ativo'
      };

      // await barbersAPI.create(newBarber);
      toast.success('Barbeiro criado com sucesso!');
      onSuccess(newBarber);
    } catch (error) {
      console.error('Erro ao criar barbeiro:', error);
      toast.error('Erro ao criar barbeiro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone *
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
            Especialidade *
          </label>
          <select
            name="specialty"
            id="specialty"
            required
            value={formData.specialty}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Selecione uma especialidade</option>
            <option value="Corte masculino e barba">Corte masculino e barba</option>
            <option value="Cortes modernos e styling">Cortes modernos e styling</option>
            <option value="Barbas e bigodes">Barbas e bigodes</option>
            <option value="Cortes clássicos">Cortes clássicos</option>
            <option value="Cabelo e barba premium">Cabelo e barba premium</option>
          </select>
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
            Experiência
          </label>
          <input
            type="text"
            name="experience"
            id="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: 5 anos"
          />
        </div>

        <div>
          <label htmlFor="commission" className="block text-sm font-medium text-gray-700">
            Comissão (%)
          </label>
          <input
            type="number"
            name="commission"
            id="commission"
            min="0"
            max="100"
            value={formData.commission}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="35"
          />
        </div>
      </div>

      <div>
        <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
          Horário de Trabalho
        </label>
        <input
          type="text"
          name="schedule"
          id="schedule"
          value={formData.schedule}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Ex: Seg-Sex: 9h-18h, Sáb: 9h-15h"
        />
      </div>

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
          placeholder="Observações especiais sobre o barbeiro..."
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
          {loading ? 'Criando...' : 'Criar Barbeiro'}
        </button>
      </div>
    </form>
  );
} 