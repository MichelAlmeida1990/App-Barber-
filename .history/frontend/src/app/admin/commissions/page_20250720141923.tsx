'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Commission {
  id: number;
  barber_id: number;
  barber_name: string;
  appointment_id?: number;
  product_id?: number;
  commission_type: 'service' | 'product';
  amount: number;
  percentage: number;
  description: string;
  date: string;
  created_at: string;
}

interface CommissionSummary {
  total_commission: number;
  service_commissions: number;
  product_commissions: number;
  total_commissions_count: number;
  barber_commissions: Record<number, {
    barber_name: string;
    total_commission: number;
    commissions_count: number;
  }>;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Carregar comissões
  const loadCommissions = useCallback(async () => {
    setLoading(true);
    try {
      let url = 'http://127.0.0.1:8000/api/v1/commissions/all';
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCommissions(data);
      } else {
        console.error('Erro ao carregar comissões');
        toast.error('Erro ao carregar comissões');
      }
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Carregar resumo
  const loadSummary = useCallback(async () => {
    try {
      let url = 'http://127.0.0.1:8000/api/v1/commissions/summary';
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  }, [startDate, endDate]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadCommissions();
    loadSummary();
  }, [loadCommissions, loadSummary]);

  // Gerar comissões automaticamente
  const generateCommissions = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/commissions/auto-generate', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadCommissions();
        loadSummary();
      } else {
        toast.error('Erro ao gerar comissões');
      }
    } catch (error) {
      console.error('Erro ao gerar comissões:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  }, [loadCommissions, loadSummary]);

  // Filtrar comissões por barbeiro
  const filteredCommissions = useMemo(() => {
    if (!selectedBarber) return commissions;
    return commissions.filter(comm => comm.barber_id === selectedBarber);
  }, [commissions, selectedBarber]);

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Comissões</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Gerencie as comissões dos barbeiros por serviços e produtos vendidos
          </p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            onClick={generateCommissions}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 mr-3"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
            Gerar Comissões
          </button>
          <button
            onClick={() => {
              loadCommissions();
              loadSummary();
            }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barbeiro
          </label>
          <select
            value={selectedBarber || ''}
            onChange={(e) => setSelectedBarber(e.target.value ? parseInt(e.target.value) : null)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Todos os barbeiros</option>
            {summary?.barber_commissions && Object.entries(summary.barber_commissions).map(([id, barber]) => (
              <option key={id} value={id}>
                {barber.barber_name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedBarber(null);
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Comissões</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(summary.total_commission)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Comissões por Serviços</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(summary.service_commissions)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Comissões por Produtos</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(summary.product_commissions)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Registros</dt>
                    <dd className="text-lg font-medium text-gray-900">{summary.total_commissions_count}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de comissões */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Comissões {selectedBarber && `- ${summary?.barber_commissions[selectedBarber]?.barber_name}`}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detalhes de todas as comissões registradas
          </p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando comissões...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barbeiro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {commission.barber_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        commission.commission_type === 'service' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {commission.commission_type === 'service' ? 'Serviço' : 'Produto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {commission.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(commission.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commission.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(commission.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredCommissions.length === 0 && !loading && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma comissão encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedBarber || startDate || endDate ? 'Tente ajustar os filtros.' : 'Comece gerando comissões automaticamente.'}
          </p>
          {!selectedBarber && !startDate && !endDate && (
            <div className="mt-6">
              <button
                onClick={generateCommissions}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                Gerar Comissões
              </button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
} 