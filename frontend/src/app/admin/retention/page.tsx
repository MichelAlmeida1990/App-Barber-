'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ClientAtRisk {
  client: {
    client_id: number;
    client_name: string;
    last_visit_date: string | null;
    days_since_last_visit: number | null;
    average_return_days: number | null;
    total_visits: number;
    risk_level: string;
    is_at_risk: boolean;
    next_expected_visit: string | null;
    barber_name: string | null;
  };
  suggested_action: string;
  days_overdue: number | null;
}

interface RetentionStats {
  total_clients: number;
  active_clients: number;
  at_risk_clients: number;
  inactive_clients: number;
  new_clients: number;
  retention_rate: number;
  average_return_days: number | null;
  clients_at_risk: ClientAtRisk[];
}

export default function RetentionPage() {
  const [stats, setStats] = useState<RetentionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);

  useEffect(() => {
    loadRetentionStats();
  }, [selectedBarber]);

  const loadRetentionStats = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');
      const url = selectedBarber 
        ? `${API_BASE_URL}/api/v1/clients/retention/stats?barber_id=${selectedBarber}`
        : `${API_BASE_URL}/api/v1/clients/retention/stats`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Erro ao carregar estatísticas de retenção');
        toast.error('Erro ao carregar dados de retenção');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
    return <ClockIcon className="h-5 w-5" />;
  };

  const formatDays = (days: number | null) => {
    if (days === null) return 'N/A';
    if (days === 0) return 'Hoje';
    if (days === 1) return '1 dia';
    return `${days} dias`;
  };

  return (
    <AdminLayout>
      <div className="pb-4 sm:pb-5 border-b border-red-200 mb-4 sm:mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-yellow-500">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold leading-6 text-gray-900">RETENÇÃO DE CLIENTES</h1>
            <p className="mt-1 sm:mt-2 max-w-4xl text-xs sm:text-sm text-gray-700">
              Monitore clientes em risco e aumente a retenção
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Carregando estatísticas...</p>
        </div>
      ) : stats ? (
        <>
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 overflow-hidden shadow-lg rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-green-700 truncate">Clientes Ativos</dt>
                      <dd className="text-xl sm:text-2xl font-semibold text-green-900">{stats.active_clients}</dd>
                      <dd className="text-xs text-green-600 mt-1">Últimos 30 dias</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 overflow-hidden shadow-lg rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-red-700 truncate">Em Risco</dt>
                      <dd className="text-xl sm:text-2xl font-semibold text-red-900">{stats.at_risk_clients}</dd>
                      <dd className="text-xs text-red-600 mt-1">Precisam atenção</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 overflow-hidden shadow-lg rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-blue-700 truncate">Taxa de Retenção</dt>
                      <dd className="text-xl sm:text-2xl font-semibold text-blue-900">{stats.retention_rate.toFixed(1)}%</dd>
                      <dd className="text-xs text-blue-600 mt-1">Clientes retidos</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 overflow-hidden shadow-lg rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-purple-700 truncate">Média de Retorno</dt>
                      <dd className="text-xl sm:text-2xl font-semibold text-purple-900">
                        {stats.average_return_days ? `${Math.round(stats.average_return_days)} dias` : 'N/A'}
                      </dd>
                      <dd className="text-xs text-purple-600 mt-1">Entre visitas</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribuição de Clientes */}
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Distribuição de Clientes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.active_clients}</div>
                <div className="text-xs sm:text-sm text-green-700 mt-1">Ativos</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.at_risk_clients}</div>
                <div className="text-xs sm:text-sm text-yellow-700 mt-1">Em Risco</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-gray-600">{stats.inactive_clients}</div>
                <div className="text-xs sm:text-sm text-gray-700 mt-1">Inativos</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.new_clients}</div>
                <div className="text-xs sm:text-sm text-blue-700 mt-1">Novos</div>
              </div>
            </div>
          </div>

          {/* Lista de Clientes em Risco */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                Clientes em Risco ({stats.clients_at_risk.length})
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Clientes que não retornam há mais tempo que o esperado
              </p>
            </div>

            {stats.clients_at_risk.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente em risco</h3>
                <p className="mt-1 text-sm text-gray-500">Todos os clientes estão retornando normalmente!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Versão Mobile - Cards */}
                <div className="block md:hidden">
                  {stats.clients_at_risk.map((item) => (
                    <div key={item.client.client_id} className="p-4 space-y-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{item.client.client_name}</div>
                          {item.client.barber_name && (
                            <div className="text-xs text-gray-500 mt-0.5">Barbeiro: {item.client.barber_name}</div>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getRiskColor(item.client.risk_level)}`}>
                          {item.client.risk_level}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-gray-600">Sem retorno há:</div>
                          <div className="font-semibold text-gray-900">{formatDays(item.client.days_since_last_visit)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Frequência média:</div>
                          <div className="font-semibold text-gray-900">
                            {item.client.average_return_days ? `${Math.round(item.client.average_return_days)} dias` : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {item.days_overdue && item.days_overdue > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <div className="text-xs font-medium text-red-800">
                            {item.days_overdue} dias em atraso
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="text-xs font-medium text-blue-800 mb-1">Ação Sugerida:</div>
                        <div className="text-xs text-blue-700">{item.suggested_action}</div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors flex items-center justify-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          Contatar
                        </button>
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          Mensagem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Versão Desktop - Tabela */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Barbeiro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sem Retorno
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequência Média
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ação Sugerida
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.clients_at_risk.map((item) => (
                        <tr key={item.client.client_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.client.client_name}</div>
                            <div className="text-sm text-gray-500">{item.client.total_visits} visitas</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.client.barber_name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDays(item.client.days_since_last_visit)}</div>
                            {item.days_overdue && item.days_overdue > 0 && (
                              <div className="text-xs text-red-600 font-medium">
                                {item.days_overdue} dias em atraso
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.client.average_return_days ? `${Math.round(item.client.average_return_days)} dias` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(item.client.risk_level)}`}>
                              {getRiskIcon(item.client.risk_level)}
                              <span className="ml-1 capitalize">{item.client.risk_level}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{item.suggested_action}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-md transition-colors" title="Contatar">
                                <PhoneIcon className="h-5 w-5" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-md transition-colors" title="Enviar mensagem">
                                <EnvelopeIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar dados</h3>
          <p className="mt-1 text-sm text-gray-500">Tente recarregar a página</p>
        </div>
      )}
    </AdminLayout>
  );
}

