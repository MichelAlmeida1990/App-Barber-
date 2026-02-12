'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { CurrencyDollarIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { IconFallback } from '@/components/IconFallback';

interface Sale {
  id: string | number;
  description: string;
  amount: number;
  date: string;
  barber_id?: number;
  barber_name?: string;
  payment_method?: string;
}

interface SaleApiResponse {
  id: string | number;
  description?: string;
  amount?: number;
  valor_final?: number;
  date?: string;
  data_criacao?: string;
  itens?: Array<{ nome: string }>;
  cliente_nome?: string;
  barbeiro_id?: number;
  barbeiro_nome?: string;
  payment_method?: string;
  forma_pagamento?: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    barber_id: '',
    payment_method: 'cash'
  });

  useEffect(() => {
    loadSales();
  }, []);

  const formatCurrency = (value?: number) => {
    const safeValue = Number.isFinite(value) ? (value as number) : 0;
    return safeValue.toFixed(2);
  };

  const loadSales = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Token não encontrado');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/sales/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((item: SaleApiResponse) => {
              const amount = typeof item.amount === 'number'
                ? item.amount
                : typeof item.valor_final === 'number'
                  ? item.valor_final
                  : 0;
              const description = item.description
                ?? (Array.isArray(item.itens) && item.itens.length > 0
                  ? item.itens.map((it) => it.nome).join(' + ')
                  : item.cliente_nome
                    ? `Venda - ${item.cliente_nome}`
                    : 'Venda');
              const date = item.date ?? item.data_criacao ?? new Date().toISOString();
              const payment_method = item.payment_method ?? item.forma_pagamento;

              return {
                id: item.id,
                description,
                amount,
                date,
                barber_id: item.barbeiro_id,
                barber_name: item.barbeiro_nome,
                payment_method
              } as Sale;
            })
          : [];

        setSales(normalized);
      } else if (response.status === 404) {
        // Endpoint não existe, usar lista vazia
        setSales([]);
      } else {
        toast.error('Erro ao carregar vendas');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        payment_method: formData.payment_method
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/sales/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Venda registrada com sucesso!');
        resetForm();
        loadSales();
      } else {
        toast.error('Erro ao registrar venda');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao registrar venda');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja remover esta venda?')) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/v1/sales/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Venda removida!');
        loadSales();
      } else {
        toast.error('Erro ao remover venda');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover venda');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      barber_id: '',
      payment_method: 'cash'
    });
    setShowForm(false);
  };

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.amount, 0);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="pb-6 mb-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Vendas</h1>
              <p className="text-gray-300 text-sm mt-1">Gerencie as vendas da barbearia</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-green-700 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Receita Total</p>
                <p className="text-4xl font-bold text-white mt-2">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total de Vendas</p>
                <p className="text-4xl font-bold text-white mt-2">{sales.length}</p>
              </div>
              <div className="bg-blue-900/30 p-4 rounded-lg">
                <IconFallback type="scissors" size="md" className="text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Registrar Nova Venda</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Corte + Barba"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Data</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Método de Pagamento</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="card">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="check">Cheque</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Registrar Venda
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 border border-gray-600 text-gray-300 hover:text-gray-200 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sales List */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando vendas...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center">
            <CurrencyDollarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma venda registrada ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-750">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300">Descrição</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300">Valor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300">Pagamento</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{sale.description}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-400">R$ {formatCurrency(sale.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(sale.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{sale.payment_method || '-'}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-900/20 rounded-lg"
                        title="Deletar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
