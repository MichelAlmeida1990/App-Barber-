'use client';

import { useState } from 'react';
import { productsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { generateId } from '@/lib/utils';

interface ProductFormProps {
  onSuccess: (product: any) => void;
  onCancel: () => void;
}

export default function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    costPrice: 0,
    salePrice: 0,
    stock: 0,
    minStock: 5,
    supplier: '',
    active: true
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
    
    if (!formData.name || !formData.category || formData.salePrice <= 0) {
      toast.error('Nome, categoria e preço são obrigatórios');
      return;
    }

    if (formData.salePrice <= formData.costPrice) {
      toast.error('Preço de venda deve ser maior que o preço de custo');
      return;
    }

    setLoading(true);
    try {
      const newProduct = {
        id: generateId('product'),
        ...formData,
        status: formData.stock > formData.minStock ? 'normal' : 
                formData.stock > 0 ? 'baixo' : 'esgotado'
      };

      // await productsAPI.create(newProduct);
      toast.success('Produto criado com sucesso!');
      onSuccess(newProduct);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome do Produto *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: Pomada Modeladora"
          />
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            Marca
          </label>
          <input
            type="text"
            name="brand"
            id="brand"
            value={formData.brand}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: QOD Barber Shop"
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
            <option value="Cabelo">Cabelo</option>
            <option value="Barba">Barba</option>
            <option value="Cuidados">Cuidados</option>
            <option value="Higiene">Higiene</option>
            <option value="Ferramentas">Ferramentas</option>
            <option value="Cosméticos">Cosméticos</option>
          </select>
        </div>

        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
            Fornecedor
          </label>
          <input
            type="text"
            name="supplier"
            id="supplier"
            value={formData.supplier}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Nome do fornecedor"
          />
        </div>

        <div>
          <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700">
            Preço de Custo (R$)
          </label>
          <input
            type="number"
            name="costPrice"
            id="costPrice"
            min="0"
            step="0.01"
            value={formData.costPrice}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="15.00"
          />
        </div>

        <div>
          <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
            Preço de Venda (R$) *
          </label>
          <input
            type="number"
            name="salePrice"
            id="salePrice"
            required
            min="0"
            step="0.01"
            value={formData.salePrice}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="25.00"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Estoque Atual
          </label>
          <input
            type="number"
            name="stock"
            id="stock"
            min="0"
            value={formData.stock}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="50"
          />
        </div>

        <div>
          <label htmlFor="minStock" className="block text-sm font-medium text-gray-700">
            Estoque Mínimo
          </label>
          <input
            type="number"
            name="minStock"
            id="minStock"
            min="0"
            value={formData.minStock}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="5"
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
          placeholder="Descrição detalhada do produto..."
        />
      </div>

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
          Produto ativo (disponível para venda)
        </label>
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
          {loading ? 'Criando...' : 'Criar Produto'}
        </button>
      </div>
    </form>
  );
} 