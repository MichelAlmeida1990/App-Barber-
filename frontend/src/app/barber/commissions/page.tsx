'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ScissorsIcon,
  ShoppingBagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Commission {
  id: number;
  appointment_id: number | null;
  product_id: number | null;
  commission_type: string;
  amount: number;
  percentage: number;
  description: string;
  date: string;
  created_at: string;
}

interface CommissionSummary {
  barber_id: number;
  barber_name: string;
  total_commission: number;
  service_commissions: number;
  product_commissions: number;
  total_commissions_count: number;
  monthly_commissions: { [key: string]: number };
  growth_rate: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export default function BarberCommissionsPage() {
  const [ setUser] = useState<any>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/barber/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'barber') {
      router.push('/barber/login');
      return;
    }

    setUser(parsedUser);
    loadCommissionsData(token, parsedUser.barber_id);
  }, [router, selectedPeriod]);

  const loadCommissionsData = async (token: string, barberId: number) => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      // Carregar resumo
      const summaryResponse = await fetch(
        `${API_BASE_URL}/api/v1/commissions/barber/${barberId}/summary`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }

      // Carregar lista de comissões
      const commissionsResponse = await fetch(
        `${API_BASE_URL}/api/v1/commissions/barber/${barberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (commissionsResponse.ok) {
        const commissionsData = await commissionsResponse.json();
        setCommissions(commissionsData);
      }
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (type: string) => {
    return type === 'service' ? (
      <ScissorsIcon className="h-5 w-5" />
    ) : (
      <ShoppingBagIcon className="h-5 w-5" />
    );
  };

  const getTypeLabel = (type: string) => {
    return type === 'service' ? 'Serviço' : 'Produto';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-white mt-4">Carregando comissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/barber/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Voltar
            </button>
            <div className="bg-green-600 p-2 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Minhas Comissões</h1>
              <p className="text-gray-300 text-sm">
                Acompanhe seus ganhos e performance
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Cards de Resumo */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Total do Mês</p>
                <CurrencyDollarIcon className="h-6 w-6 text-green-200" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(summary.total_commission)}</p>
              {summary.growth_rate !== 0 && (
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${summary.growth_rate >= 0 ? 'text-green-200' : 'text-red-300 transform rotate-180'}`} />
                  <span className="text-sm">
                    {summary.growth_rate >= 0 ? '+' : ''}{summary.growth_rate.toFixed(1)}% vs mês anterior
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Serviços</p>
                <ScissorsIcon className="h-6 w-6 text-blue-200" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(summary.service_commissions)}</p>
              <p className="text-sm text-blue-100 mt-2">
                {((summary.service_commissions / summary.total_commission) * 100 || 0).toFixed(0)}% do total
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Produtos</p>
                <ShoppingBagIcon className="h-6 w-6 text-purple-200" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(summary.product_commissions)}</p>
              <p className="text-sm text-purple-100 mt-2">
                {((summary.product_commissions / summary.total_commission) * 100 || 0).toFixed(0)}% do total
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-100 text-sm">Total de Comissões</p>
                <ChartBarIcon className="h-6 w-6 text-orange-200" />
              </div>
              <p className="text-3xl font-bold">{summary.total_commissions_count}</p>
              <p className="text-sm text-orange-100 mt-2">
                Média: {formatCurrency(summary.total_commission / summary.total_commissions_count || 0)}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Comissões */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Histórico de Comissões</h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="current_month">Mês Atual</option>
                <option value="last_month">Mês Anterior</option>
                <option value="last_3_months">Últimos 3 Meses</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {commissions.length === 0 ? (
              <div className="p-12 text-center">
                <CurrencyDollarIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Nenhuma comissão encontrada
                </h3>
                <p className="text-gray-500">
                  Complete agendamentos para gerar comissões
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Taxa
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-300">{formatDate(commission.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            commission.commission_type === 'service' 
                              ? 'bg-blue-900 text-blue-200' 
                              : 'bg-purple-900 text-purple-200'
                          }`}>
                            {getTypeIcon(commission.commission_type)}
                            <span className="ml-1">{getTypeLabel(commission.commission_type)}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{commission.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-400">{commission.percentage.toFixed(1)}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-green-400">
                          {formatCurrency(commission.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}











