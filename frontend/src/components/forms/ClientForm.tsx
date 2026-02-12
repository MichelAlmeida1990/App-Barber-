'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { generateId } from '@/lib/utils';

interface ClientFormProps {
  onSuccess: (client: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function ClientForm({ onSuccess, onCancel, initialData }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    birthDate: initialData?.birthDate || '',
    address: initialData?.address || '',
    notes: initialData?.notes || ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        birthDate: initialData.birthDate || '',
        address: initialData.address || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Simulando criação do cliente (substitua pela chamada real da API)
      const newClient = {
        id: initialData?.id || generateId('client'),
        ...formData,
        lastVisit: new Date().toISOString().split('T')[0],
        totalVisits: 0,
        loyaltyPoints: 0,
        status: 'ativo'
      };

      // await.create(newClient);
      toast.success('Cliente criado com sucesso!');
      onSuccess(newClient);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast.error('Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700">
            Nome *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700">
            Telefone *
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label htmlFor="birthDate" className="block text-xs sm:text-sm font-medium text-gray-700">
            Data de Nascimento
          </label>
          <input
            type="date"
            name="birthDate"
            id="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700">
          Endereço
        </label>
        <input
          type="text"
          name="address"
          id="address"
          value={formData.address}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Endereço completo"
        />
      </div>

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
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Preferências, observações especiais..."
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (initialData ? 'Salvando...' : 'Criando...') : (initialData ? 'Salvar Alterações' : 'Criar Cliente')}
        </button>
      </div>
    </form>
  );
} 