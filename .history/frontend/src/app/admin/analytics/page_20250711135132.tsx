'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ScissorsIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { analyticsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30d');

  // Dados mockados para demonstração
  const metrics = {
    revenue: {
      current: 12450.00,
      previous: 10200.00,
      growth: 22.1
    },
    appointments: {
      current: 187,
      previous: 145,
      growth: 29.0
    },
    clients: {
      current: 89,
      previous: 76,
      growth: 17.1
    },
    avgTicket: {
      current: 66.58,
      previous: 70.34,
      growth: -5.3
    }
  };

  const revenueByDay = [
    { day: 'Seg', revenue: 1200 },
    { day: 'Ter', revenue: 1850 },
    { day: 'Qua', revenue: 2100 },
    { day: 'Qui', revenue: 1950 },
    { day: 'Sex', revenue: 2850 },
    { day: 'Sáb', revenue: 3200 },
    { day: 'Dom', revenue: 890 }
  ];

  const topServices = [
    { name: 'Corte + Barba', bookings: 45, revenue: 2025.00 },
    { name: 'Corte Masculino', bookings: 38, revenue: 1140.00 },
    { name: 'Barba Completa', bookings: 25, revenue: 625.00 },
    { name: 'Corte Premium', bookings: 18, revenue: 900.00 },
  ];

  const topBarbers = [
    { name: 'Carlos Silva', appointments: 52, revenue: 2340.00, rating: 4.9 },
    { name: 'André Santos', appointments: 41, revenue: 1845.00, rating: 4.7 },
    { name: 'Roberto Costa', appointments: 35, revenue: 1575.00, rating: 4.8 },
  ];

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.test();
      console.log('Analytics API Response:', response.data);
      toast.success('API de analytics funcionando!');
    } catch (error) {
      console.error('Erro na API de analytics:', error);
      toast.error('Erro ao conectar com API de analytics');
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

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 transform rotate-180" />
    );
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Analytics</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Acompanhe o desempenho da sua barbearia com métricas detalhadas
          </p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <button
            onClick={testAPI}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar API'}
          </button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Receita Total</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(metrics.revenue.current)}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${getGrowthColor(metrics.revenue.growth)}`}>
                      {getGrowthIcon(metrics.revenue.growth)}
                      <span className="ml-1">{Math.abs(metrics.revenue.growth)}%</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Agendamentos</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.appointments.current}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${getGrowthColor(metrics.appointments.growth)}`}>
                      {getGrowthIcon(metrics.appointments.growth)}
                      <span className="ml-1">{Math.abs(metrics.appointments.growth)}%</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Clientes Únicos</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.clients.current}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${getGrowthColor(metrics.clients.growth)}`}>
                      {getGrowthIcon(metrics.clients.growth)}
                      <span className="ml-1">{Math.abs(metrics.clients.growth)}%</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Ticket Médio</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(metrics.avgTicket.current)}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${getGrowthColor(metrics.avgTicket.growth)}`}>
                      {getGrowthIcon(metrics.avgTicket.growth)}
                      <span className="ml-1">{Math.abs(metrics.avgTicket.growth)}%</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de receita por dia */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Receita por Dia da Semana
          </h3>
          <div className="flex items-end justify-between h-64 space-x-2">
            {revenueByDay.map((item, index) => {
              const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue));
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex items-end justify-center mb-2">
                    <div
                      className="bg-indigo-500 rounded-t w-full max-w-12 transition-all duration-300 hover:bg-indigo-600"
                      style={{ height: `${height}%` }}
                      title={formatCurrency(item.revenue)}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{item.day}</span>
                  <span className="text-xs text-gray-900 mt-1">{formatCurrency(item.revenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Serviços */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
              <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Serviços Mais Populares
            </h3>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500">{service.bookings} agendamentos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(service.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Barbeiros */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
              <ScissorsIcon className="h-5 w-5 text-blue-500 mr-2" />
              Barbeiros Top Performance
            </h3>
            <div className="space-y-4">
              {topBarbers.map((barber, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{barber.name}</p>
                      <p className="text-sm text-gray-500">{barber.appointments} agendamentos • ⭐ {barber.rating}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(barber.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas operacionais */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tempo Médio de Atendimento</dt>
                  <dd className="text-lg font-medium text-gray-900">47 min</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taxa de Ocupação</dt>
                  <dd className="text-lg font-medium text-gray-900">78%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taxa de Retenção</dt>
                  <dd className="text-lg font-medium text-gray-900">85%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 