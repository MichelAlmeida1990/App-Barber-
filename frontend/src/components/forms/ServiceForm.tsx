'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { generateId } from '@/lib/utils';

interface ServiceFormProps {
  onSuccess: (service: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function ServiceForm({ onSuccess, onCancel, initialData }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: typeof initialData?.price === 'number' ? initialData.price : 0,
    duration: typeof initialData?.duration === 'number' ? initialData.duration : 30,
    category: initialData?.category || '',
    active: typeof initialData?.active === 'boolean' ? initialData.active : true,
    hasPause: typeof initialData?.hasPause === 'boolean' ? initialData.hasPause : false,
    pauseDuration: typeof initialData?.pauseDuration === 'number' ? initialData.pauseDuration : 0,
    pauseDescription: initialData?.pauseDescription || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 :
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast.error('Nome, categoria e preço são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const newService = {
        id: initialData?.id || generateId('service'),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration: formData.duration,
        category: formData.category,
        active: formData.active,
        hasPause: formData.hasPause,
        pauseDuration: formData.pauseDuration,
        pauseDescription: formData.pauseDescription,
        popularity: initialData?.popularity || 0
      };

      // await.create(newService);
      toast.success('Serviço criado com sucesso!');
      onSuccess(newService);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast.error('Erro ao criar serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome do Serviço *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: Corte Masculino"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Categoria *
          </label>
          <select
            name="category"
            id="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Selecione uma categoria</option>
            <option value="Corte">Corte</option>
            <option value="Barba">Barba</option>
            <option value="Combo">Combo</option>
            <option value="Acabamento">Acabamento</option>
            <option value="Tratamento">Tratamento</option>
            <option value="Especial">Especial</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Preço (R$) *
          </label>
          <input
            type="number"
            name="price"
            id="price"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="30.00"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duração (minutos)
          </label>
          <input
            type="number"
            name="duration"
            id="duration"
            min="5"
            step="5"
            value={formData.duration}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Descrição detalhada do serviço..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleInputChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
            Serviço ativo (disponível para agendamento)
          </label>
        </div>

        {/* Seção de Pausa - Sempre visível */}
        <div className="border-t-4 border-yellow-500 pt-4 mt-4 bg-yellow-50 -mx-4 px-4 py-3 rounded-lg">
          <div className="mb-2">
            <h4 className="text-sm font-bold text-yellow-900 bg-yellow-200 px-3 py-2 rounded-md inline-block">
              ⚙️ CONFIGURAÇÕES AVANÇADAS - SERVIÇOS COM PAUSA
            </h4>
            <p className="text-xs text-yellow-800 mt-2 font-medium">Configure pausas para serviços químicos (Progressiva, Alisamento, etc.)</p>
          </div>
          <div className="flex items-start mb-4 bg-white p-3 rounded border-2 border-yellow-400">
            <input
              id="hasPause"
              name="hasPause"
              type="checkbox"
              checked={formData.hasPause}
              onChange={handleInputChange}
              className="h-5 w-5 mt-0.5 text-yellow-600 focus:ring-yellow-500 border-yellow-400 rounded"
            />
            <div className="ml-3 flex-1">
              <label htmlFor="hasPause" className="block text-sm font-bold text-yellow-900 cursor-pointer">
                ✅ Serviço com pausa (ex: Progressiva, Alisamento)
              </label>
              <p className="mt-1 text-xs text-yellow-800 font-medium">
                ⚠️ Marque esta opção se o serviço requer tempo de espera durante o atendimento
              </p>
            </div>
          </div>
          
          {formData.hasPause && (
            <div className="ml-6 space-y-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded">
                  ⏸️ CONFIGURAÇÃO DE PAUSA
                </span>
              </div>
              <div>
                <label htmlFor="pauseDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duração da pausa (minutos) *
                </label>
                <input
                  type="number"
                  name="pauseDuration"
                  id="pauseDuration"
                  min="5"
                  step="5"
                  required={formData.hasPause}
                  value={formData.pauseDuration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="60"
                />
                <p className="mt-1 text-xs text-gray-600">
                  ⚡ Durante a pausa, o barbeiro poderá atender outros clientes
                </p>
              </div>
              
              <div>
                <label htmlFor="pauseDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição da pausa
                </label>
                <textarea
                  name="pauseDescription"
                  id="pauseDescription"
                  rows={2}
                  value={formData.pauseDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ex: Aguardar produto fazer efeito (60 minutos)"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de mais conteúdo abaixo */}
      {!formData.hasPause && (
        <div className="text-center py-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ⬇️ Role para baixo para ver mais opções
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
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
          {loading ? 'Criando...' : 'Criar Serviço'}
        </button>
      </div>
    </form>
  );
} 